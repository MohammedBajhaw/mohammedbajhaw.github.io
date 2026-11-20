import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { HERO_MAX_IMAGES } from '../platform-settings.schema';

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

export class UpdateHeroSettingsDto {
  /** Only pictures uploaded through the API are accepted, so the hero never points at an outside address. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(HERO_MAX_IMAGES)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  @Matches(/^\/uploads\/images\/[A-Za-z0-9._-]+$/, {
    each: true,
    message: 'each hero image must be an uploaded image path (/uploads/images/...)',
  })
  images?: string[];

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(60)
  intervalSeconds?: number;
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
  @Type(() => UpdateHeroSettingsDto)
  hero?: UpdateHeroSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PlatformSettingsTranslationsDto)
  translations?: PlatformSettingsTranslationsDto;
}
