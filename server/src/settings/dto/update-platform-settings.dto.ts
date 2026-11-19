import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateMaintenanceSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  estimatedReturnAt?: string;

  @IsOptional()
  @IsBoolean()
  allowAdminBypass?: boolean;
}

export class ToggleMaintenanceDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  estimatedReturnAt?: string;
}

export class UpdateFeatureFlagsDto {
  @IsOptional()
  @IsBoolean()
  contactFormEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  projectsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  publicationsEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  servicesEnabled?: boolean;
}

export class UpdateSeoSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  defaultTitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  defaultDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImageUrl?: string;
}

export class PlatformSettingsTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  siteTagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  maintenanceTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  maintenanceMessage?: string;
}

export class PlatformSettingsTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformSettingsTranslationFieldsDto)
  ar?: PlatformSettingsTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformSettingsTranslationFieldsDto)
  tr?: PlatformSettingsTranslationFieldsDto;
}

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  siteName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  siteTagline?: string;

  @IsOptional()
  @IsIn(['en', 'ar', 'tr'])
  defaultLanguage?: 'en' | 'ar' | 'tr';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  faviconUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateSeoSettingsDto)
  seo?: UpdateSeoSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFeatureFlagsDto)
  features?: UpdateFeatureFlagsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateMaintenanceSettingsDto)
  maintenance?: UpdateMaintenanceSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformSettingsTranslationsDto)
  translations?: PlatformSettingsTranslationsDto;
}
