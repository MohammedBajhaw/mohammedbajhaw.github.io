import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  BACKUP_DESTINATIONS,
  type BackupDestinationType,
} from '../backup-settings.schema';

export class UpdateBackupSettingsDto {
  @IsOptional()
  @IsIn(BACKUP_DESTINATIONS)
  destinationType?: BackupDestinationType;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  targetUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9-]*$/, {
    message: 'authHeaderName may only contain letters, digits, and hyphens.',
  })
  authHeaderName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  authSecret?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  driveFolderId?: string;

  @IsOptional()
  @IsBoolean()
  includeContactMessages?: boolean;
}
