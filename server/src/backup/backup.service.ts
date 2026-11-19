import { createHash, randomUUID } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import type { Connection, Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import {
  BackupSettings,
  BackupSettingsDocument,
  type BackupDestinationType,
} from './backup-settings.schema';
import type { UpdateBackupSettingsDto } from './dto/update-backup-settings.dto';

export interface BackupAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface PublicBackupSettings {
  destinationType: BackupDestinationType;
  targetUrl: string;
  authHeaderName: string;
  hasSecret: boolean;
  secretMasked: string | null;
  driveFolderId: string;
  includeContactMessages: boolean;
  lastBackupAt?: string;
  lastBackupStatus?: 'success' | 'error';
  lastBackupMessage?: string;
  lastBackupSizeBytes?: number;
}

export interface ReferencedAssetInfo {
  storagePath: string;
  category: 'images' | 'videos' | 'documents';
  filename: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

export interface StructuredBackupSnapshot {
  filename: string;
  meta: {
    version: '2.0';
    service: 'mohammed-bajhaw-portfolio';
    exportedAt: string;
    totalRecords: number;
    totalAssets: number;
    counts: Record<string, number>;
  };
  database: {
    identity: {
      profile: Record<string, unknown>[];
      skills: Record<string, unknown>[];
      experiences: Record<string, unknown>[];
      education: Record<string, unknown>[];
      achievements: Record<string, unknown>[];
    };
    portfolio: {
      projects: Record<string, unknown>[];
      publications: Record<string, unknown>[];
      service_areas: Record<string, unknown>[];
    };
    system: {
      platform_settings: Record<string, unknown>[];
      translation_settings: Record<string, unknown>[];
    };
    inbox: {
      contact_messages: Record<string, unknown>[];
    };
  };
  assets: ReferencedAssetInfo[];
}

export interface BackupRunResult {
  ok: boolean;
  filename: string;
  destinationType: BackupDestinationType;
  sizeBytes: number;
  uploadedAt: string;
  uploadedAssetsCount: number;
  message: string;
  remoteId?: string;
}

const GOOGLE_DRIVE_UPLOAD_URL =
  'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
const GOOGLE_DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const SAFE_UPLOAD_PATH_REGEX = /^\/uploads\/(images|videos|documents)\/([a-zA-Z0-9._-]+)$/;

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function maskSecret(secret: string): string | null {
  const trimmed = secret.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= 8) {
    return '****';
  }
  return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
}

function validateSafeTargetUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'Invalid destination targetUrl format.',
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalhost)) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'Backup destination URL must use HTTPS (or HTTP only for localhost).',
    );
  }

  if (
    hostname === '169.254.169.254' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('169.254.') ||
    hostname.endsWith('.internal')
  ) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'Disallowed internal metadata host in targetUrl.',
    );
  }

  return trimmed;
}

function normalizeDriveFolderId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const folderMatch = /\/folders\/([a-zA-Z0-9_-]+)/.exec(trimmed);
  if (folderMatch?.[1]) {
    return folderMatch[1];
  }
  return trimmed.split(/[?#]/)[0]?.trim() ?? '';
}

function serializeDocument(doc: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id') {
      output.id =
        value !== null && typeof value === 'object' && 'toString' in value
          ? (value as { toString(): string }).toString()
          : String(value);
      continue;
    }
    output[key] = value;
  }
  return output;
}

function collectUploadPaths(value: unknown, found: Set<string>): void {
  if (typeof value === 'string') {
    const match = SAFE_UPLOAD_PATH_REGEX.exec(value.trim());
    if (match) {
      found.add(`/uploads/${match[1]}/${match[2]}`);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectUploadPaths(item, found);
    }
    return;
  }

  if (value !== null && typeof value === 'object') {
    for (const entry of Object.values(value)) {
      collectUploadPaths(entry, found);
    }
  }
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(
    @InjectModel(BackupSettings.name)
    private readonly settingsModel: Model<BackupSettingsDocument>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly auditService: AuditService,
  ) {}

  private async getOrCreateDoc(): Promise<BackupSettingsDocument> {
    const existing = await this.settingsModel.findOne({ key: 'default' }).exec();
    if (existing) {
      return existing;
    }
    return this.settingsModel.create({ key: 'default' });
  }

  private toPublicSettings(doc: BackupSettings): PublicBackupSettings {
    return {
      destinationType: doc.destinationType,
      targetUrl: doc.targetUrl,
      authHeaderName: doc.authHeaderName || 'Authorization',
      hasSecret: doc.authSecret.trim().length > 0,
      secretMasked: maskSecret(doc.authSecret),
      driveFolderId: doc.driveFolderId,
      includeContactMessages: doc.includeContactMessages,
      ...(doc.lastBackupAt ? { lastBackupAt: doc.lastBackupAt.toISOString() } : {}),
      ...(doc.lastBackupStatus ? { lastBackupStatus: doc.lastBackupStatus } : {}),
      ...(doc.lastBackupMessage ? { lastBackupMessage: doc.lastBackupMessage } : {}),
      ...(doc.lastBackupSizeBytes !== undefined
        ? { lastBackupSizeBytes: doc.lastBackupSizeBytes }
        : {}),
    };
  }

  async getSettings(): Promise<PublicBackupSettings> {
    const doc = await this.getOrCreateDoc();
    return this.toPublicSettings(doc);
  }

  async updateSettings(
    dto: UpdateBackupSettingsDto,
    actorEmail: string,
    meta: BackupAuditMeta = {},
  ): Promise<PublicBackupSettings> {
    const doc = await this.getOrCreateDoc();
    const updatePayload: Record<string, unknown> = {};

    if (dto.destinationType !== undefined) {
      updatePayload.destinationType = dto.destinationType;
    }
    if (dto.targetUrl !== undefined) {
      updatePayload.targetUrl = validateSafeTargetUrl(dto.targetUrl);
    }
    if (dto.authHeaderName !== undefined) {
      updatePayload.authHeaderName = dto.authHeaderName.trim() || 'Authorization';
    }
    if (dto.authSecret !== undefined) {
      updatePayload.authSecret = dto.authSecret.trim();
    }
    if (dto.driveFolderId !== undefined) {
      updatePayload.driveFolderId = normalizeDriveFolderId(dto.driveFolderId);
    }
    if (dto.includeContactMessages !== undefined) {
      updatePayload.includeContactMessages = dto.includeContactMessages;
    }

    const updated = await this.settingsModel
      .findByIdAndUpdate(doc._id, { $set: updatePayload }, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update backup settings.',
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: '/api/backup/settings',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_BACKUP_SETTINGS',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return this.toPublicSettings(updated);
  }

  private async readCollectionSorted(
    collectionName: string,
    sortField?: string,
  ): Promise<Record<string, unknown>[]> {
    const db = this.connection.db;
    if (!db) {
      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.SERVICE_UNAVAILABLE,
        'Database connection is not ready.',
      );
    }

    const cursor = db.collection(collectionName).find({});
    if (sortField) {
      cursor.sort({ [sortField]: 1, createdAt: -1 });
    }
    const docs = await cursor.toArray();

    return docs.map((doc) => {
      const clean = serializeDocument(doc);
      if (collectionName === 'translation_settings' && 'apiKey' in clean) {
        delete clean.apiKey;
      }
      return clean;
    });
  }

  private async resolveReferencedAssets(
    databaseTree: StructuredBackupSnapshot['database'],
  ): Promise<Array<ReferencedAssetInfo & { absolutePath: string; content: Buffer }>> {
    const paths = new Set<string>();
    collectUploadPaths(databaseTree, paths);

    const assets: Array<ReferencedAssetInfo & { absolutePath: string; content: Buffer }> = [];

    for (const storagePath of paths) {
      const match = SAFE_UPLOAD_PATH_REGEX.exec(storagePath);
      if (!match?.[1] || !match[2]) {
        continue;
      }

      const category = match[1] as 'images' | 'videos' | 'documents';
      const filename = basename(match[2]);
      const absolutePath = join(process.cwd(), 'uploads', category, filename);

      try {
        const info = await stat(absolutePath);
        if (!info.isFile()) {
          continue;
        }
        const content = await readFile(absolutePath);
        const sha256 = createHash('sha256').update(content).digest('hex');
        const ext = extname(filename).toLowerCase();
        assets.push({
          storagePath,
          category,
          filename,
          mimeType: EXT_TO_MIME[ext] ?? 'application/octet-stream',
          sizeBytes: info.size,
          sha256,
          absolutePath,
          content,
        });
      } catch {
        // Referenced file not present on disk; skip gracefully
      }
    }

    return assets;
  }

  private async buildStructuredSnapshot(includeContactMessages: boolean): Promise<{
    snapshot: StructuredBackupSnapshot;
    assetFiles: Array<ReferencedAssetInfo & { absolutePath: string; content: Buffer }>;
  }> {
    const [
      profile,
      skills,
      experiences,
      education,
      achievements,
      projects,
      publications,
      serviceAreas,
      platformSettings,
      translationSettings,
      contactMessages,
    ] = await Promise.all([
      this.readCollectionSorted('profile'),
      this.readCollectionSorted('skills', 'sort_order'),
      this.readCollectionSorted('experiences', 'sort_order'),
      this.readCollectionSorted('education', 'sort_order'),
      this.readCollectionSorted('achievements', 'sort_order'),
      this.readCollectionSorted('projects', 'sort_order'),
      this.readCollectionSorted('publications', 'sort_order'),
      this.readCollectionSorted('service_areas', 'sort_order'),
      this.readCollectionSorted('platform_settings'),
      this.readCollectionSorted('translation_settings'),
      includeContactMessages
        ? this.readCollectionSorted('contact_messages', 'createdAt')
        : Promise.resolve([]),
    ]);

    const database: StructuredBackupSnapshot['database'] = {
      identity: {
        profile,
        skills,
        experiences,
        education,
        achievements,
      },
      portfolio: {
        projects,
        publications,
        service_areas: serviceAreas,
      },
      system: {
        platform_settings: platformSettings,
        translation_settings: translationSettings,
      },
      inbox: {
        contact_messages: contactMessages,
      },
    };

    const assetFiles = await this.resolveReferencedAssets(database);

    const counts: Record<string, number> = {
      profile: profile.length,
      skills: skills.length,
      experiences: experiences.length,
      education: education.length,
      achievements: achievements.length,
      projects: projects.length,
      publications: publications.length,
      service_areas: serviceAreas.length,
      platform_settings: platformSettings.length,
      translation_settings: translationSettings.length,
      ...(includeContactMessages ? { contact_messages: contactMessages.length } : {}),
    };

    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');

    const snapshot: StructuredBackupSnapshot = {
      filename: `mohammed-bajhaw-backup-${stamp}.json`,
      meta: {
        version: '2.0',
        service: 'mohammed-bajhaw-portfolio',
        exportedAt: now.toISOString(),
        totalRecords,
        totalAssets: assetFiles.length,
        counts,
      },
      database,
      assets: assetFiles.map((asset) => ({
        storagePath: asset.storagePath,
        category: asset.category,
        filename: asset.filename,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        sha256: asset.sha256,
      })),
    };

    return { snapshot, assetFiles };
  }

  private async createDriveFolder(
    accessToken: string,
    name: string,
    parentId?: string,
  ): Promise<string> {
    const response = await fetch(GOOGLE_DRIVE_FILES_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId ? { parents: [parentId] } : {}),
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_GATEWAY,
        `Google Drive folder creation failed (${response.status}): ${errText.slice(0, 220) || 'Check access token and folder permissions.'}`,
      );
    }

    const body = (await response.json()) as { id?: unknown };
    if (typeof body.id !== 'string' || !body.id) {
      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        'Google Drive did not return a folder ID.',
      );
    }
    return body.id;
  }

  private async uploadFileToDrive(
    accessToken: string,
    name: string,
    mimeType: string,
    content: Buffer,
    parentId?: string,
  ): Promise<string | undefined> {
    const boundary = `bajhaw-part-${randomUUID()}`;
    const metadataJson = JSON.stringify({
      name,
      mimeType,
      ...(parentId ? { parents: [parentId] } : {}),
    });

    const preamble = Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadataJson}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
      'utf8',
    );
    const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const body = Buffer.concat([preamble, content, epilogue]);

    const response = await fetch(GOOGLE_DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_GATEWAY,
        `Google Drive upload failed (${response.status}): ${errText.slice(0, 220) || 'Check access token and permissions.'}`,
      );
    }

    const parsed = (await response.json().catch(() => null)) as { id?: unknown } | null;
    return parsed && typeof parsed.id === 'string' ? parsed.id : undefined;
  }

  async exportSnapshot(
    actorEmail: string,
    meta: BackupAuditMeta = {},
  ): Promise<StructuredBackupSnapshot> {
    const settings = await this.getOrCreateDoc();
    const { snapshot } = await this.buildStructuredSnapshot(settings.includeContactMessages);

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'GET',
      path: '/api/backup/export',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'EXPORT_BACKUP_JSON',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return snapshot;
  }

  async runRemoteBackup(
    actorEmail: string,
    meta: BackupAuditMeta = {},
  ): Promise<BackupRunResult> {
    const settings = await this.getOrCreateDoc();
    const { snapshot, assetFiles } = await this.buildStructuredSnapshot(
      settings.includeContactMessages,
    );
    const jsonBuffer = Buffer.from(JSON.stringify(snapshot, null, 2), 'utf8');
    const totalAssetsBytes = assetFiles.reduce((sum, item) => sum + item.sizeBytes, 0);
    const totalBytes = jsonBuffer.byteLength + totalAssetsBytes;
    const startedAt = Date.now();

    try {
      let remoteId: string | undefined;

      if (settings.destinationType === 'google_drive') {
        const accessToken = settings.authSecret.trim();
        if (!accessToken) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_REQUEST,
            'Google Drive OAuth access token is required in backup settings.',
          );
        }

        const rootParentId = normalizeDriveFolderId(settings.driveFolderId) || undefined;
        const backupFolderName = snapshot.filename.replace(/\.json$/i, '');
        const backupFolderId = await this.createDriveFolder(
          accessToken,
          backupFolderName,
          rootParentId,
        );

        await this.uploadFileToDrive(
          accessToken,
          'database.json',
          'application/json',
          jsonBuffer,
          backupFolderId,
        );

        if (assetFiles.length > 0) {
          const uploadsFolderId = await this.createDriveFolder(
            accessToken,
            'uploads',
            backupFolderId,
          );
          const categoryFolders = new Map<string, string>();

          for (const asset of assetFiles) {
            let catFolderId = categoryFolders.get(asset.category);
            if (!catFolderId) {
              catFolderId = await this.createDriveFolder(
                accessToken,
                asset.category,
                uploadsFolderId,
              );
              categoryFolders.set(asset.category, catFolderId);
            }

            await this.uploadFileToDrive(
              accessToken,
              asset.filename,
              asset.mimeType,
              asset.content,
              catFolderId,
            );
          }
        }

        remoteId = backupFolderId;
      } else {
        const targetUrl = validateSafeTargetUrl(settings.targetUrl);
        if (!targetUrl) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_REQUEST,
            'Destination URL is not configured in backup settings.',
          );
        }

        const webhookPayload = {
          ...snapshot,
          embeddedAssets: assetFiles.map((asset) => ({
            storagePath: asset.storagePath,
            category: asset.category,
            filename: asset.filename,
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            sha256: asset.sha256,
            contentBase64: asset.content.toString('base64'),
          })),
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Backup-Filename': snapshot.filename,
        };
        const secret = settings.authSecret.trim();
        const headerName = settings.authHeaderName.trim() || 'Authorization';
        if (secret) {
          headers[headerName] = secret;
        }

        const response = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(45_000),
        });

        if (!response.ok) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_GATEWAY,
            `Backup destination responded with status ${response.status}.`,
          );
        }
      }

      const uploadedAt = new Date();
      const assetsNote =
        assetFiles.length > 0 ? ` + ${assetFiles.length} referenced file(s)` : '';
      const message =
        settings.destinationType === 'google_drive'
          ? `Uploaded structured database.json${assetsNote} to Google Drive folder${remoteId ? ` (${remoteId})` : ''}.`
          : `Uploaded structured backup${assetsNote} to configured endpoint.`;

      await this.settingsModel
        .findByIdAndUpdate(settings._id, {
          $set: {
            lastBackupAt: uploadedAt,
            lastBackupStatus: 'success',
            lastBackupMessage: message,
            lastBackupSizeBytes: totalBytes,
          },
        })
        .exec();

      void this.auditService.record({
        requestId: meta.requestId ?? randomUUID(),
        method: 'POST',
        path: '/api/backup/run',
        statusCode: HttpStatus.OK,
        outcome: 'success',
        durationMs: Date.now() - startedAt,
        action: 'RUN_REMOTE_BACKUP',
        actor: actorEmail,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return {
        ok: true,
        filename: snapshot.filename,
        destinationType: settings.destinationType,
        sizeBytes: totalBytes,
        uploadedAt: uploadedAt.toISOString(),
        uploadedAssetsCount: assetFiles.length,
        message,
        ...(remoteId ? { remoteId } : {}),
      };
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Backup upload failed.';
      this.logger.warn(`Backup upload failed: ${errMessage}`);

      await this.settingsModel
        .findByIdAndUpdate(settings._id, {
          $set: {
            lastBackupAt: new Date(),
            lastBackupStatus: 'error',
            lastBackupMessage: errMessage.slice(0, 300),
            lastBackupSizeBytes: totalBytes,
          },
        })
        .exec()
        .catch(() => undefined);

      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        `Failed to upload backup: ${errMessage}`,
      );
    }
  }
}
