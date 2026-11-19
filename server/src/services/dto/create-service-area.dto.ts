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

export class ServiceItemTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  summary?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];
}

export class ServiceItemTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceItemTranslationFieldsDto)
  ar?: ServiceItemTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceItemTranslationFieldsDto)
  tr?: ServiceItemTranslationFieldsDto;
}

export class ServiceItemDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(1200)
  summary!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceItemTranslationsDto)
  translations?: ServiceItemTranslationsDto;
}

export class ServiceAreaTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}

export class ServiceAreaTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceAreaTranslationFieldsDto)
  ar?: ServiceAreaTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceAreaTranslationFieldsDto)
  tr?: ServiceAreaTranslationFieldsDto;
}

export class CreateServiceAreaDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(1000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  accent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services?: ServiceItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceAreaTranslationsDto)
  translations?: ServiceAreaTranslationsDto;
}
