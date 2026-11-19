import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProjectMediaTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;
}

export class ProjectMediaTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectMediaTranslationFieldsDto)
  ar?: ProjectMediaTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectMediaTranslationFieldsDto)
  tr?: ProjectMediaTranslationFieldsDto;
}

export class ProjectMediaItemDto {
  @IsString()
  @MaxLength(400)
  storage_path!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectMediaTranslationsDto)
  translations?: ProjectMediaTranslationsDto;
}

export class ProjectTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  rich_content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  end_date?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];
}

export class ProjectTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectTranslationFieldsDto)
  ar?: ProjectTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectTranslationFieldsDto)
  tr?: ProjectTranslationFieldsDto;
}

export class CreateProjectDto {
  @IsString()
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by hyphens.',
  })
  slug!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  subtitle?: string;

  @IsString()
  @MaxLength(1200)
  summary!: string;

  @IsString()
  @MaxLength(15000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30000)
  rich_content?: string;

  @IsString()
  @MaxLength(80)
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  start_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  end_date?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(400)
  repository_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(400)
  publication_url?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMediaItemDto)
  project_media?: ProjectMediaItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectTranslationsDto)
  translations?: ProjectTranslationsDto;
}
