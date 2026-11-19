import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { Injectable } from '@nestjs/common';
import { AuditService } from '@/audit/audit.service';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';

export type UploadCategory = 'images' | 'videos' | 'documents';

export interface UploadAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface UploadedFileResult {
  category: UploadCategory;
  filename: string;
  url: string;
  size: number;
}

interface SignatureRule {
  category: UploadCategory;
  matches: (header: Buffer) => boolean;
}

const UPLOAD_ROOT = join(process.cwd(), 'uploads');
const CATEGORIES: UploadCategory[] = ['images', 'videos', 'documents'];

function hasBytes(header: Buffer, bytes: number[], offset = 0): boolean {
  if (header.length < offset + bytes.length) {
    return false;
  }
  return bytes.every((byte, index) => header[offset + index] === byte);
}

// Magic-byte checks so a renamed/spoofed file can never slip in under a declared
// mimetype it doesn't actually have.
const SIGNATURE_RULES: Record<string, SignatureRule> = {
  'image/png': {
    category: 'images',
    matches: (h) => hasBytes(h, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  'image/jpeg': {
    category: 'images',
    matches: (h) => hasBytes(h, [0xff, 0xd8, 0xff]),
  },
  'image/gif': {
    category: 'images',
    matches: (h) => hasBytes(h, [0x47, 0x49, 0x46, 0x38]),
  },
  'image/webp': {
    category: 'images',
    matches: (h) => hasBytes(h, [0x52, 0x49, 0x46, 0x46]) && hasBytes(h, [0x57, 0x45, 0x42, 0x50], 8),
  },
  'video/mp4': {
    category: 'videos',
    matches: (h) => h.length > 11 && h.subarray(4, 8).toString('ascii') === 'ftyp',
  },
  'video/webm': {
    category: 'videos',
    matches: (h) => hasBytes(h, [0x1a, 0x45, 0xdf, 0xa3]),
  },
  'application/pdf': {
    category: 'documents',
    matches: (h) => hasBytes(h, [0x25, 0x50, 0x44, 0x46]),
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    category: 'documents',
    matches: (h) => hasBytes(h, [0x50, 0x4b, 0x03, 0x04]),
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    category: 'documents',
    matches: (h) => hasBytes(h, [0x50, 0x4b, 0x03, 0x04]),
  },
};

@Injectable()
export class UploadsService {
  constructor(private readonly auditService: AuditService) {}

  private logAction(
    action: string,
    method: string,
    path: string,
    statusCode: number,
    outcome: 'success' | 'error',
    actor: string,
    meta: UploadAuditMeta,
  ): void {
    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method,
      path,
      statusCode,
      outcome,
      durationMs: 0,
      action,
      actor,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  }

  private async discard(path: string): Promise<void> {
    try {
      await unlink(path);
    } catch {
      // already gone
    }
  }

  async recordUploadedFile(
    file: Express.Multer.File,
    actor: string,
    meta: UploadAuditMeta = {},
  ): Promise<UploadedFileResult> {
    const rule = SIGNATURE_RULES[file.mimetype];

    if (!rule) {
      await this.discard(file.path);
      this.logAction('UPLOAD_REJECTED_TYPE', 'POST', '/api/uploads', 400, 'error', actor, meta);
      throw new AppException(ErrorCode.BAD_REQUEST, undefined, `Unsupported file type: ${file.mimetype}.`);
    }

    const header = await readFile(file.path)
      .then((buffer) => buffer.subarray(0, 16))
      .catch(() => Buffer.alloc(0));

    if (!rule.matches(header)) {
      await this.discard(file.path);
      this.logAction('UPLOAD_REJECTED_SIGNATURE', 'POST', '/api/uploads', 400, 'error', actor, meta);
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        undefined,
        'The file content does not match its declared type.',
      );
    }

    const { category } = rule;
    const targetDir = join(UPLOAD_ROOT, category);
    await mkdir(targetDir, { recursive: true });
    const targetPath = join(targetDir, file.filename);
    await rename(file.path, targetPath);

    this.logAction('UPLOAD_FILE', 'POST', '/api/uploads', 201, 'success', actor, meta);

    return {
      category,
      filename: file.filename,
      url: `/uploads/${category}/${file.filename}`,
      size: file.size,
    };
  }

  async removeFile(
    category: string,
    filename: string,
    actor: string,
    meta: UploadAuditMeta = {},
  ): Promise<void> {
    if (!CATEGORIES.includes(category as UploadCategory)) {
      throw new AppException(ErrorCode.BAD_REQUEST, undefined, `Unknown upload category: ${category}.`);
    }

    const categoryDir = resolve(UPLOAD_ROOT, category);
    const targetPath = resolve(categoryDir, filename);

    if (targetPath !== categoryDir && !targetPath.startsWith(categoryDir + sep)) {
      throw new AppException(ErrorCode.BAD_REQUEST, undefined, 'Invalid file path.');
    }

    try {
      await unlink(targetPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    this.logAction(
      'UPLOAD_DELETE',
      'DELETE',
      `/api/uploads/${category}/${filename}`,
      200,
      'success',
      actor,
      meta,
    );
  }
}
