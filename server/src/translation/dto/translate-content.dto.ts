import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  TRANSLATION_OUTPUT_FORMATS,
  type TranslationOutputFormat,
} from '../translation.constants';

export class TranslateContentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(25000)
  text?: string;

  @IsOptional()
  @IsObject()
  fields?: Record<string, string | Record<string, string>>;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{2,8})?$/)
  sourceLanguage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Matches(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{2,8})?$/, { each: true })
  targetLanguages?: string[];

  @IsOptional()
  @IsIn(TRANSLATION_OUTPUT_FORMATS)
  outputFormat?: TranslationOutputFormat;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  customInstructions?: string;
}
