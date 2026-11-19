import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

export const BACKUP_DESTINATIONS = ['webhook', 'google_drive'] as const;
export type BackupDestinationType = (typeof BACKUP_DESTINATIONS)[number];

export type BackupSettingsDocument = HydratedDocument<BackupSettings>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'backup_settings' })
export class BackupSettings {
  @Prop({ required: true, unique: true, default: 'default' })
  key!: string;

  @Prop({
    type: String,
    enum: BACKUP_DESTINATIONS,
    default: 'webhook',
  })
  destinationType!: BackupDestinationType;

  @Prop({ trim: true, default: '' })
  targetUrl!: string;

  @Prop({ trim: true, default: 'Authorization' })
  authHeaderName!: string;

  @Prop({ trim: true, default: '' })
  authSecret!: string;

  @Prop({ trim: true, default: '' })
  driveFolderId!: string;

  @Prop({ default: true })
  includeContactMessages!: boolean;

  @Prop()
  lastBackupAt?: Date;

  @Prop({ enum: ['success', 'error'] })
  lastBackupStatus?: 'success' | 'error';

  @Prop({ trim: true })
  lastBackupMessage?: string;

  @Prop()
  lastBackupSizeBytes?: number;
}

export const BackupSettingsSchema = SchemaFactory.createForClass(BackupSettings);
