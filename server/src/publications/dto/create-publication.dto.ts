import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PublicationTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  venue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  publication_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  authors?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  details?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

export class PublicationTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PublicationTranslationFieldsDto)
  ar?: PublicationTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PublicationTranslationFieldsDto)
  tr?: PublicationTranslationFieldsDto;
}

export class CreatePublicationDto {
  @IsString()
  @MaxLength(300)
  title!: string;

  @IsString()
  @MaxLength(240)
  venue!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  publication_date?: string;

  @IsString()
  @MaxLength(80)
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  authors?: string;

  @IsString()
  @MaxLength(1200)
  summary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(15000)
  details?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  doi?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PublicationTranslationsDto)
  translations?: PublicationTranslationsDto;
}
