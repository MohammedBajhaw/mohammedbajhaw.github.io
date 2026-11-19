import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ExperienceTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  role?: string;

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
  @MaxLength(40)
  start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  end_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];
}

export class ExperienceTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceTranslationFieldsDto)
  ar?: ExperienceTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceTranslationFieldsDto)
  tr?: ExperienceTranslationFieldsDto;
}

export class CreateExperienceDto {
  @IsString()
  @MaxLength(160)
  role!: string;

  @IsString()
  @MaxLength(160)
  organization!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsString()
  @MaxLength(40)
  start_date!: string;

  @IsString()
  @MaxLength(40)
  end_date!: string;

  @IsOptional()
  @IsBoolean()
  is_current?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceTranslationsDto)
  translations?: ExperienceTranslationsDto;
}

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  role?: string;

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
  @MaxLength(40)
  start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_current?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ExperienceTranslationsDto)
  translations?: ExperienceTranslationsDto;
}
