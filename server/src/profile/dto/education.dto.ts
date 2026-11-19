import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class EducationTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  degree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  field?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;
}

export class EducationTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EducationTranslationFieldsDto)
  ar?: EducationTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationTranslationFieldsDto)
  tr?: EducationTranslationFieldsDto;
}

export class CreateEducationDto {
  @IsString()
  @MaxLength(160)
  institution!: string;

  @IsString()
  @MaxLength(160)
  degree!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  field?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsString()
  @MaxLength(20)
  start_year!: string;

  @IsString()
  @MaxLength(20)
  end_year!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationTranslationsDto)
  translations?: EducationTranslationsDto;
}

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  institution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  degree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  field?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  start_year?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  end_year?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationTranslationsDto)
  translations?: EducationTranslationsDto;
}
