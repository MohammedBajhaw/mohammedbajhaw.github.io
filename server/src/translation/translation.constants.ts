export const TRANSLATION_PROVIDERS = ['openai_compatible', 'gemini'] as const;
export type TranslationProvider = (typeof TRANSLATION_PROVIDERS)[number];

export const TRANSLATION_OUTPUT_FORMATS = [
  'natural',
  'formal',
  'technical',
  'concise',
] as const;
export type TranslationOutputFormat = (typeof TRANSLATION_OUTPUT_FORMATS)[number];

export interface SupportedLanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  enabled: boolean;
}

export const DEFAULT_SUPPORTED_LANGUAGES: SupportedLanguageConfig[] = [
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    enabled: true,
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    enabled: true,
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    rtl: false,
    enabled: true,
  },
];

export const DEFAULT_TRANSLATION_SYSTEM_PROMPT =
  'You are an expert multilingual technical translator for an engineering and AI portfolio. ' +
  'Detect the source language automatically, preserve technical terms, code identifiers, product names, and markdown/formatting structure accurately, ' +
  'and produce natural, publication-ready translations for each requested target language.';

export const DEFAULT_OPENAI_COMPATIBLE_BASE_URL = 'https://api.openai.com/v1';
export const DEFAULT_OPENAI_COMPATIBLE_MODEL = 'gpt-4o-mini';
export const DEFAULT_GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_TRANSLATION_TIMEOUT_MS = 30_000;
