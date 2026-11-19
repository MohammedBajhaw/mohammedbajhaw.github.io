import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  TRANSLATION_PROVIDERS,
  type TranslationProvider,
} from '../translation.constants';

export class TestTranslationDto {
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
}
