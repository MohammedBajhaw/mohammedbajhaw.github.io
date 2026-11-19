import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import type {
  ToggleMaintenanceDto,
  UpdatePlatformSettingsDto,
} from './dto/update-platform-settings.dto';
import {
  PlatformSettings,
  PlatformSettingsDocument,
} from './platform-settings.schema';

export interface SettingsAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface MaintenanceStatusView {
  enabled: boolean;
  title: string;
  message: string;
  estimatedReturnAt?: string;
  allowAdminBypass: boolean;
  translations?: {
    ar?: { title?: string; message?: string };
    tr?: { title?: string; message?: string };
  };
}

function assignNestedFields(
  target: Record<string, unknown>,
  prefix: string,
  source: object | undefined,
): void {
  if (!source) {
    return;
  }
  for (const [key, value] of Object.entries(source)) {
    if (value !== undefined) {
      target[`${prefix}.${key}`] = typeof value === 'string' ? value.trim() : value;
    }
  }
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(PlatformSettings.name)
    private readonly settingsModel: Model<PlatformSettingsDocument>,
    private readonly auditService: AuditService,
  ) {}

  private async getOrCreateDoc(): Promise<PlatformSettingsDocument> {
    const existing = await this.settingsModel.findOne({ key: 'default' }).exec();
    if (existing) {
      return existing;
    }
    return this.settingsModel.create({ key: 'default' });
  }

  async getSettings(): Promise<PlatformSettings> {
    return this.getOrCreateDoc();
  }

  async getMaintenanceStatus(): Promise<MaintenanceStatusView> {
    const doc = await this.getOrCreateDoc();
    return {
      enabled: doc.maintenance.enabled,
      title: doc.maintenance.title,
      message: doc.maintenance.message,
      ...(doc.maintenance.estimatedReturnAt
        ? { estimatedReturnAt: doc.maintenance.estimatedReturnAt }
        : {}),
      allowAdminBypass: doc.maintenance.allowAdminBypass,
      ...(doc.translations
        ? {
            translations: {
              ...(doc.translations.ar
                ? {
                    ar: {
                      title: doc.translations.ar.maintenanceTitle,
                      message: doc.translations.ar.maintenanceMessage,
                    },
                  }
                : {}),
              ...(doc.translations.tr
                ? {
                    tr: {
                      title: doc.translations.tr.maintenanceTitle,
                      message: doc.translations.tr.maintenanceMessage,
                    },
                  }
                : {}),
            },
          }
        : {}),
    };
  }

  async updateSettings(
    dto: UpdatePlatformSettingsDto,
    actorEmail: string,
    meta: SettingsAuditMeta = {},
  ): Promise<PlatformSettings> {
    const doc = await this.getOrCreateDoc();
    const setPayload: Record<string, unknown> = {};

    if (dto.siteName !== undefined) {
      setPayload.siteName = dto.siteName.trim();
    }
    if (dto.siteTagline !== undefined) {
      setPayload.siteTagline = dto.siteTagline.trim();
    }
    if (dto.defaultLanguage !== undefined) {
      setPayload.defaultLanguage = dto.defaultLanguage;
    }
    if (dto.logoUrl !== undefined) {
      setPayload.logoUrl = dto.logoUrl.trim();
    }
    if (dto.faviconUrl !== undefined) {
      setPayload.faviconUrl = dto.faviconUrl.trim();
    }

    assignNestedFields(setPayload, 'seo', dto.seo);
    assignNestedFields(setPayload, 'features', dto.features);
    assignNestedFields(setPayload, 'maintenance', dto.maintenance);
    assignNestedFields(setPayload, 'translations.ar', dto.translations?.ar);
    assignNestedFields(setPayload, 'translations.tr', dto.translations?.tr);

    if (Object.keys(setPayload).length === 0) {
      return doc;
    }

    const updated = await this.settingsModel
      .findByIdAndUpdate(
        doc._id,
        { $set: setPayload },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update platform settings.',
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: '/api/settings',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_PLATFORM_SETTINGS',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return updated;
  }

  async toggleMaintenance(
    dto: ToggleMaintenanceDto,
    actorEmail: string,
    meta: SettingsAuditMeta = {},
  ): Promise<MaintenanceStatusView> {
    const doc = await this.getOrCreateDoc();
    const setPayload: Record<string, unknown> = {
      'maintenance.enabled': dto.enabled,
    };

    if (dto.title !== undefined) {
      setPayload['maintenance.title'] = dto.title.trim();
    }
    if (dto.message !== undefined) {
      setPayload['maintenance.message'] = dto.message.trim();
    }
    if (dto.estimatedReturnAt !== undefined) {
      setPayload['maintenance.estimatedReturnAt'] = dto.estimatedReturnAt.trim();
    }

    await this.settingsModel
      .findByIdAndUpdate(
        doc._id,
        { $set: setPayload },
        { new: true, runValidators: true },
      )
      .exec();

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: '/api/settings/maintenance',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: dto.enabled ? 'ENABLE_MAINTENANCE' : 'DISABLE_MAINTENANCE',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return this.getMaintenanceStatus();
  }
}
