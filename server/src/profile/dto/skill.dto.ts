import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class SkillTranslationFieldsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;
}

export class SkillTranslationsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SkillTranslationFieldsDto)
  ar?: SkillTranslationFieldsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SkillTranslationFieldsDto)
  tr?: SkillTranslationFieldsDto;
}

export class CreateSkillDto {
  @IsString()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(120)
  category!: string;

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
  @ValidateNested()
  @Type(() => SkillTranslationsDto)
  translations?: SkillTranslationsDto;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

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
  @ValidateNested()
  @Type(() => SkillTranslationsDto)
  translations?: SkillTranslationsDto;
}
