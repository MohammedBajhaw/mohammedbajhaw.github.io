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
import {
  ProjectMediaItemDto,
  ProjectTranslationsDto,
} from './create-project.dto';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric words separated by hyphens.',
  })
  slug?: string;

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
