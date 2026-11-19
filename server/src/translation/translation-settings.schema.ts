import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import {
  DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
  DEFAULT_OPENAI_COMPATIBLE_MODEL,
  DEFAULT_SUPPORTED_LANGUAGES,
  DEFAULT_TRANSLATION_SYSTEM_PROMPT,
  DEFAULT_TRANSLATION_TIMEOUT_MS,
  TRANSLATION_OUTPUT_FORMATS,
  TRANSLATION_PROVIDERS,
  type SupportedLanguageConfig,
  type TranslationOutputFormat,
  type TranslationProvider,
} from './translation.constants';

export type TranslationSettingsDocument = HydratedDocument<TranslationSettings>;

@Schema({ _id: false })
export class SupportedLanguageSchemaItem implements SupportedLanguageConfig {
  @Prop({ required: true, trim: true, lowercase: true })
  code!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  nativeName!: string;

  @Prop({ default: false })
  rtl!: boolean;

  @Prop({ default: true })
  enabled!: boolean;
}

const SupportedLanguageItemSchema = SchemaFactory.createForClass(SupportedLanguageSchemaItem);

@Schema({
  timestamps: true,
  collection: 'translation_settings',
})
export class TranslationSettings {
  @Prop({ required: true, unique: true, default: 'default' })
  key!: string;

  @Prop({ default: true })
  enabled!: boolean;

  @Prop({
    type: String,
    enum: TRANSLATION_PROVIDERS,
    default: 'openai_compatible',
  })
  provider!: TranslationProvider;

  @Prop({ trim: true, default: DEFAULT_OPENAI_COMPATIBLE_BASE_URL })
  apiBaseUrl!: string;

  @Prop({ trim: true, default: '' })
  apiKey!: string;

  @Prop({ trim: true, default: DEFAULT_OPENAI_COMPATIBLE_MODEL })
  model!: string;

  @Prop({
    type: String,
    enum: TRANSLATION_OUTPUT_FORMATS,
    default: 'technical',
  })
  outputFormat!: TranslationOutputFormat;

  @Prop({ trim: true, default: DEFAULT_TRANSLATION_SYSTEM_PROMPT })
  systemPrompt!: string;

  @Prop({ trim: true, default: '' })
  customInstructions!: string;

  @Prop({ min: 0, max: 1.5, default: 0.2 })
  temperature!: number;

  @Prop({ min: 3000, max: 120000, default: DEFAULT_TRANSLATION_TIMEOUT_MS })
  timeoutMs!: number;

  @Prop({
    type: [SupportedLanguageItemSchema],
    default: () => DEFAULT_SUPPORTED_LANGUAGES,
  })
  supportedLanguages!: SupportedLanguageSchemaItem[];
}

export const TranslationSettingsSchema = SchemaFactory.createForClass(TranslationSettings);
