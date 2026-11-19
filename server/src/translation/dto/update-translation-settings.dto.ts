import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  TRANSLATION_OUTPUT_FORMATS,
  TRANSLATION_PROVIDERS,
  type TranslationOutputFormat,
  type TranslationProvider,
} from '../translation.constants';

export class SupportedLanguageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(16)
  @Matches(/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{2,8})?$/)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  nativeName!: string;

  @IsOptional()
  @IsBoolean()
  rtl?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class UpdateTranslationSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsIn(TRANSLATION_PROVIDERS)
  provider?: TranslationProvider;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiBaseUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  apiKey?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  model?: string;

  @IsOptional()
  @IsIn(TRANSLATION_OUTPUT_FORMATS)
  outputFormat?: TranslationOutputFormat;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  systemPrompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customInstructions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1.5)
  temperature?: number;

  @IsOptional()
  @IsInt()
  @Min(3000)
  @Max(120000)
  timeoutMs?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SupportedLanguageDto)
  supportedLanguages?: SupportedLanguageDto[];
}
