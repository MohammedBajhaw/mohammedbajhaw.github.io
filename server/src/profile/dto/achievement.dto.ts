import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AchievementTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  badge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;
}

export class AchievementTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementTranslationFieldsDto)
  ar?: AchievementTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementTranslationFieldsDto)
  tr?: AchievementTranslationFieldsDto;
}

export class CreateAchievementDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only.',
  })
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  badge?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(500)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  project_slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementTranslationsDto)
  translations?: AchievementTranslationsDto;
}

export class UpdateAchievementDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must contain lowercase letters, numbers, and hyphens only.',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  badge?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  details?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  project_slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AchievementTranslationsDto)
  translations?: AchievementTranslationsDto;
}
