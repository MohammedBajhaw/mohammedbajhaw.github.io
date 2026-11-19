import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AuditService } from '@/audit/audit.service';
import type { EnvConfig } from '@/common/config/env.validation';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import type { TestTranslationDto } from './dto/test-translation.dto';
import type { TranslateContentDto } from './dto/translate-content.dto';
import type { UpdateTranslationSettingsDto } from './dto/update-translation-settings.dto';
import {
  DEFAULT_GEMINI_BASE_URL,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
  DEFAULT_OPENAI_COMPATIBLE_MODEL,
  DEFAULT_SUPPORTED_LANGUAGES,
  type SupportedLanguageConfig,
  type TranslationOutputFormat,
  type TranslationProvider,
} from './translation.constants';
import {
  TranslationSettings,
  TranslationSettingsDocument,
} from './translation-settings.schema';

export interface TranslationAuditMeta {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export interface PublicTranslationSettings {
  enabled: boolean;
  provider: TranslationProvider;
  apiBaseUrl: string;
  hasApiKey: boolean;
  apiKeyMasked: string | null;
  model: string;
  outputFormat: TranslationOutputFormat;
  systemPrompt: string;
  customInstructions: string;
  temperature: number;
  timeoutMs: number;
  supportedLanguages: SupportedLanguageConfig[];
}

export interface TranslationTestResult {
  ok: boolean;
  provider: TranslationProvider;
  model: string;
  latencyMs: number;
  message: string;
}

export interface TranslationResult {
  detectedSourceLanguage: string;
  targetLanguages: string[];
  provider: TranslationProvider;
  model: string;
  outputFormat: TranslationOutputFormat;
  translations?: Record<string, string>;
  fields?: Record<string, Record<string, string>>;
  translatedLanguageCount: number;
}

interface NormalizedFieldInput {
  mode: 'single' | 'map';
  sourceText: string;
  existing: Record<string, string>;
  missingLanguages: string[];
}

interface LlmStructuredResponse {
  detectedSourceLanguage?: unknown;
  fields?: unknown;
  translations?: unknown;
}

const FORMAT_GUIDANCE: Record<TranslationOutputFormat, string> = {
  natural: 'Use natural, fluent, idiomatic phrasing appropriate for modern web reading.',
  formal: 'Use formal, authoritative, executive-grade language suitable for official profiles.',
  technical:
    'Preserve precise engineering/AI terminology, acronyms, and architectural clarity while reading naturally.',
  concise: 'Keep translations crisp, concise, and direct without unnecessary filler words.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function maskApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.length <= 8) {
    return '****';
  }
  return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
}

function validateSafeApiBaseUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'Invalid apiBaseUrl format.',
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLocalhost)) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'apiBaseUrl must use HTTPS (or HTTP only for localhost).',
    );
  }

  if (
    hostname === '169.254.169.254' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('169.254.') ||
    hostname.endsWith('.internal')
  ) {
    throw new AppException(
      ErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      'Disallowed internal metadata host in apiBaseUrl.',
    );
  }

  return trimmed;
}

function extractProviderErrorMessage(rawBody: string): string | null {
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (isRecord(parsed)) {
      if (isRecord(parsed.error) && typeof parsed.error.message === 'string') {
        return parsed.error.message.trim();
      }
      if (typeof parsed.message === 'string') {
        return parsed.message.trim();
      }
    }
  } catch {
    // Non-JSON response
  }
  return null;
}

function extractJsonObject(rawContent: string): Record<string, unknown> {
  const trimmed = rawContent.trim();
  const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  const candidate = fenceMatch?.[1]?.trim() ?? trimmed;

  try {
    const parsed: unknown = JSON.parse(candidate);
    if (isRecord(parsed)) {
      return parsed;
    }
  } catch {
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const sliced = candidate.slice(firstBrace, lastBrace + 1);
      try {
        const parsed: unknown = JSON.parse(sliced);
        if (isRecord(parsed)) {
          return parsed;
        }
      } catch {
        // Fall through to error
      }
    }
  }

  throw new AppException(
    ErrorCode.SERVICE_UNAVAILABLE,
    HttpStatus.BAD_GATEWAY,
    'External LLM provider returned a non-JSON translation payload.',
  );
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  constructor(
    @InjectModel(TranslationSettings.name)
    private readonly settingsModel: Model<TranslationSettingsDocument>,
    private readonly config: ConfigService<EnvConfig, true>,
    private readonly auditService: AuditService,
  ) {}

  private async getOrCreateSettingsDoc(): Promise<TranslationSettingsDocument> {
    const existing = await this.settingsModel.findOne({ key: 'default' }).exec();
    if (existing) {
      return existing;
    }

    const envBaseUrl = this.config.get('LLM_API_BASE_URL', { infer: true });
    const envApiKey = this.config.get('LLM_API_KEY', { infer: true });
    const envModel = this.config.get('LLM_MODEL', { infer: true });

    return this.settingsModel.create({
      key: 'default',
      apiBaseUrl: envBaseUrl ?? DEFAULT_OPENAI_COMPATIBLE_BASE_URL,
      apiKey: envApiKey ?? '',
      model: envModel ?? DEFAULT_OPENAI_COMPATIBLE_MODEL,
      supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
    });
  }

  private resolveEffectiveApiKey(settings: TranslationSettings): string {
    const stored = settings.apiKey.trim();
    if (stored.length > 0) {
      return stored;
    }
    return (this.config.get('LLM_API_KEY', { infer: true }) ?? '').trim();
  }

  private resolveEffectiveBaseUrl(settings: TranslationSettings): string {
    const stored = settings.apiBaseUrl.trim();
    if (stored.length > 0) {
      return stored;
    }
    const envUrl = this.config.get('LLM_API_BASE_URL', { infer: true });
    if (envUrl) {
      return envUrl;
    }
    return settings.provider === 'gemini'
      ? DEFAULT_GEMINI_BASE_URL
      : DEFAULT_OPENAI_COMPATIBLE_BASE_URL;
  }

  private resolveEffectiveModel(settings: TranslationSettings): string {
    const stored = settings.model.trim();
    if (stored.length > 0) {
      return stored;
    }
    const envModel = this.config.get('LLM_MODEL', { infer: true });
    if (envModel) {
      return envModel;
    }
    return settings.provider === 'gemini'
      ? DEFAULT_GEMINI_MODEL
      : DEFAULT_OPENAI_COMPATIBLE_MODEL;
  }

  private toPublicSettings(settings: TranslationSettings): PublicTranslationSettings {
    const effectiveKey = this.resolveEffectiveApiKey(settings);
    return {
      enabled: settings.enabled,
      provider: settings.provider,
      apiBaseUrl: this.resolveEffectiveBaseUrl(settings),
      hasApiKey: effectiveKey.length > 0,
      apiKeyMasked: maskApiKey(effectiveKey),
      model: this.resolveEffectiveModel(settings),
      outputFormat: settings.outputFormat,
      systemPrompt: settings.systemPrompt,
      customInstructions: settings.customInstructions,
      temperature: settings.temperature,
      timeoutMs: settings.timeoutMs,
      supportedLanguages: settings.supportedLanguages.map((lang) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        rtl: lang.rtl,
        enabled: lang.enabled,
      })),
    };
  }

  async getSettings(): Promise<PublicTranslationSettings> {
    const doc = await this.getOrCreateSettingsDoc();
    return this.toPublicSettings(doc);
  }

  async getSupportedLanguages(): Promise<SupportedLanguageConfig[]> {
    const doc = await this.getOrCreateSettingsDoc();
    return doc.supportedLanguages
      .filter((lang) => lang.enabled)
      .map((lang) => ({
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        rtl: lang.rtl,
        enabled: lang.enabled,
      }));
  }

  async updateSettings(
    dto: UpdateTranslationSettingsDto,
    actorEmail: string,
    meta: TranslationAuditMeta = {},
  ): Promise<PublicTranslationSettings> {
    const doc = await this.getOrCreateSettingsDoc();

    const updatePayload: Record<string, unknown> = {};

    if (dto.enabled !== undefined) {
      updatePayload.enabled = dto.enabled;
    }
    if (dto.provider !== undefined) {
      updatePayload.provider = dto.provider;
      if (dto.apiBaseUrl === undefined) {
        updatePayload.apiBaseUrl =
          dto.provider === 'gemini'
            ? DEFAULT_GEMINI_BASE_URL
            : DEFAULT_OPENAI_COMPATIBLE_BASE_URL;
      }
      if (dto.model === undefined) {
        updatePayload.model =
          dto.provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_COMPATIBLE_MODEL;
      }
    }
    if (dto.apiBaseUrl !== undefined) {
      updatePayload.apiBaseUrl = validateSafeApiBaseUrl(dto.apiBaseUrl);
    }
    if (dto.apiKey !== undefined) {
      updatePayload.apiKey = dto.apiKey.trim();
    }
    if (dto.model !== undefined) {
      updatePayload.model = dto.model.trim();
    }
    if (dto.outputFormat !== undefined) {
      updatePayload.outputFormat = dto.outputFormat;
    }
    if (dto.systemPrompt !== undefined) {
      updatePayload.systemPrompt = dto.systemPrompt.trim();
    }
    if (dto.customInstructions !== undefined) {
      updatePayload.customInstructions = dto.customInstructions.trim();
    }
    if (dto.temperature !== undefined) {
      updatePayload.temperature = dto.temperature;
    }
    if (dto.timeoutMs !== undefined) {
      updatePayload.timeoutMs = dto.timeoutMs;
    }
    if (dto.supportedLanguages !== undefined) {
      const seenCodes = new Set<string>();
      const normalizedLangs: SupportedLanguageConfig[] = dto.supportedLanguages.map((item) => {
        const code = item.code.trim().toLowerCase();
        if (seenCodes.has(code)) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_REQUEST,
            `Duplicate language code "${code}" in supportedLanguages.`,
          );
        }
        seenCodes.add(code);
        return {
          code,
          name: item.name.trim(),
          nativeName: item.nativeName.trim(),
          rtl: item.rtl ?? false,
          enabled: item.enabled ?? true,
        };
      });

      if (!normalizedLangs.some((lang) => lang.enabled)) {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          'At least one supported language must remain enabled.',
        );
      }

      updatePayload.supportedLanguages = normalizedLangs;
    }

    const updated = await this.settingsModel
      .findByIdAndUpdate(
        doc._id,
        { $set: updatePayload },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new AppException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update translation settings.',
      );
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'PATCH',
      path: '/api/translation/settings',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'UPDATE_TRANSLATION_SETTINGS',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return this.toPublicSettings(updated);
  }

  private resolveTargetLanguages(
    settings: TranslationSettings,
    requestedTargets?: string[],
  ): SupportedLanguageConfig[] {
    const enabledLanguages = settings.supportedLanguages.filter((lang) => lang.enabled);
    if (!requestedTargets || requestedTargets.length === 0) {
      return enabledLanguages;
    }

    const byCode = new Map(enabledLanguages.map((lang) => [lang.code, lang]));
    const selected: SupportedLanguageConfig[] = [];
    for (const rawCode of requestedTargets) {
      const code = rawCode.trim().toLowerCase();
      const match = byCode.get(code);
      if (!match) {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          `Target language "${code}" is not enabled in translation settings.`,
        );
      }
      if (!selected.some((item) => item.code === code)) {
        selected.push(match);
      }
    }
    return selected;
  }

  private normalizeFieldsInput(
    dto: TranslateContentDto,
    targetCodes: string[],
  ): { isSingleText: boolean; normalized: Record<string, NormalizedFieldInput> } {
    if (dto.text && dto.fields) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Provide either "text" or "fields", not both.',
      );
    }

    if (!dto.text && !dto.fields) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Either "text" or "fields" must be provided for translation.',
      );
    }

    if (dto.text !== undefined) {
      const trimmed = dto.text.trim();
      if (!trimmed) {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          'Text for translation cannot be empty.',
        );
      }
      return {
        isSingleText: true,
        normalized: {
          text: {
            mode: 'single',
            sourceText: trimmed,
            existing: {},
            missingLanguages: [...targetCodes],
          },
        },
      };
    }

    const rawFields = dto.fields ?? {};
    const fieldKeys = Object.keys(rawFields);
    if (fieldKeys.length === 0 || fieldKeys.length > 30) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Fields must contain between 1 and 30 entries.',
      );
    }

    const normalized: Record<string, NormalizedFieldInput> = {};

    for (const key of fieldKeys) {
      const value = rawFields[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_REQUEST,
            `Field "${key}" cannot be empty.`,
          );
        }
        normalized[key] = {
          mode: 'single',
          sourceText: trimmed,
          existing: {},
          missingLanguages: [...targetCodes],
        };
      } else if (isRecord(value)) {
        const existing: Record<string, string> = {};
        let firstNonEmpty = '';
        for (const [langCode, langText] of Object.entries(value)) {
          if (typeof langText !== 'string') {
            throw new AppException(
              ErrorCode.BAD_REQUEST,
              HttpStatus.BAD_REQUEST,
              `Field "${key}.${langCode}" must be a string.`,
            );
          }
          const trimmed = langText.trim();
          if (trimmed.length > 0) {
            const normalizedCode = langCode.trim().toLowerCase();
            existing[normalizedCode] = trimmed;
            if (!firstNonEmpty) {
              firstNonEmpty = trimmed;
            }
          }
        }

        if (!firstNonEmpty) {
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_REQUEST,
            `Field "${key}" must contain at least one non-empty language value.`,
          );
        }

        const missingLanguages = targetCodes.filter((code) => !existing[code]);
        normalized[key] = {
          mode: 'map',
          sourceText: firstNonEmpty,
          existing,
          missingLanguages,
        };
      } else {
        throw new AppException(
          ErrorCode.BAD_REQUEST,
          HttpStatus.BAD_REQUEST,
          `Field "${key}" must be a string or a language map.`,
        );
      }
    }

    return { isSingleText: false, normalized };
  }

  private async callExternalLlm(
    settings: TranslationSettings,
    systemMessage: string,
    userMessage: string,
  ): Promise<Record<string, unknown>> {
    const apiKey = this.resolveEffectiveApiKey(settings);
    if (!apiKey) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Translation LLM API key is not configured in translation settings or environment.',
      );
    }

    const baseUrl = validateSafeApiBaseUrl(this.resolveEffectiveBaseUrl(settings));
    const model = this.resolveEffectiveModel(settings);
    const timeoutMs = settings.timeoutMs || 30_000;

    if (settings.provider === 'gemini') {
      const endpoint = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemMessage }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userMessage }],
              },
            ],
            generationConfig: {
              temperature: settings.temperature,
              responseMimeType: 'application/json',
            },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        this.logger.error(`Gemini translation request failed: ${message}`);
        throw new AppException(
          ErrorCode.SERVICE_UNAVAILABLE,
          HttpStatus.BAD_GATEWAY,
          'Failed to reach external Gemini translation API.',
        );
      }

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        this.logger.warn(`Gemini API error (${response.status}): ${errBody.slice(0, 300)}`);
        throw new AppException(
          ErrorCode.SERVICE_UNAVAILABLE,
          HttpStatus.BAD_GATEWAY,
          `External LLM API responded with status ${response.status}.`,
        );
      }

      const data: unknown = await response.json();
      if (isRecord(data) && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const first: unknown = data.candidates[0];
        if (isRecord(first) && isRecord(first.content) && Array.isArray(first.content.parts)) {
          const firstPart: unknown = first.content.parts[0];
          if (isRecord(firstPart) && typeof firstPart.text === 'string') {
            return extractJsonObject(firstPart.text);
          }
        }
      }

      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        'Unexpected response structure from Gemini API.',
      );
    }

    // Default: openai_compatible
    const endpoint = `${baseUrl}/chat/completions`;
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: settings.temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error';
      this.logger.error(`OpenAI-compatible translation request failed: ${message}`);
      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        'Failed to reach external LLM translation API.',
      );
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      this.logger.warn(`LLM API error (${response.status}): ${errBody.slice(0, 300)}`);
      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        `External LLM API responded with status ${response.status}.`,
      );
    }

    const data: unknown = await response.json();
    if (isRecord(data) && Array.isArray(data.choices) && data.choices.length > 0) {
      const firstChoice: unknown = data.choices[0];
      if (
        isRecord(firstChoice) &&
        isRecord(firstChoice.message) &&
        typeof firstChoice.message.content === 'string'
      ) {
        return extractJsonObject(firstChoice.message.content);
      }
    }

    throw new AppException(
      ErrorCode.SERVICE_UNAVAILABLE,
      HttpStatus.BAD_GATEWAY,
      'Unexpected response structure from external LLM API.',
    );
  }

  async testConnection(
    dto: TestTranslationDto,
    actorEmail: string,
    meta: TranslationAuditMeta = {},
  ): Promise<TranslationTestResult> {
    const doc = await this.getOrCreateSettingsDoc();

    const effectiveProvider = dto.provider ?? doc.provider;
    const rawBaseUrl =
      dto.apiBaseUrl?.trim() ||
      (dto.provider && dto.provider !== doc.provider
        ? dto.provider === 'gemini'
          ? DEFAULT_GEMINI_BASE_URL
          : DEFAULT_OPENAI_COMPATIBLE_BASE_URL
        : this.resolveEffectiveBaseUrl(doc));
    const effectiveBaseUrl = validateSafeApiBaseUrl(rawBaseUrl);
    const effectiveModel = dto.model?.trim() || this.resolveEffectiveModel(doc);
    const effectiveApiKey = dto.apiKey?.trim() || this.resolveEffectiveApiKey(doc);

    if (!effectiveApiKey) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'No API key provided or saved yet.',
      );
    }

    const startedAt = Date.now();
    const timeoutMs = Math.min(doc.timeoutMs || 15_000, 20_000);

    try {
      if (effectiveProvider === 'gemini') {
        const endpoint = `${effectiveBaseUrl}/models/${encodeURIComponent(effectiveModel)}:generateContent?key=${encodeURIComponent(effectiveApiKey)}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Reply with OK' }] }],
            generationConfig: { maxOutputTokens: 5, temperature: 0 },
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          const providerDetail = extractProviderErrorMessage(errText);
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_GATEWAY,
            providerDetail
              ? `External LLM API (${response.status}): ${providerDetail}`
              : `External LLM API returned ${response.status}.`,
          );
        }
      } else {
        const endpoint = `${effectiveBaseUrl}/chat/completions`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveApiKey}`,
          },
          body: JSON.stringify({
            model: effectiveModel,
            max_tokens: 5,
            temperature: 0,
            messages: [{ role: 'user', content: 'Reply with OK' }],
          }),
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          const providerDetail = extractProviderErrorMessage(errText);
          throw new AppException(
            ErrorCode.BAD_REQUEST,
            HttpStatus.BAD_GATEWAY,
            providerDetail
              ? `External LLM API (${response.status}): ${providerDetail}`
              : response.status === 401 || response.status === 403
                ? `Authentication failed (${response.status}): Invalid or unauthorized API key.`
                : `External LLM API returned status ${response.status}. Check API address and model name.`,
          );
        }
      }

      const latencyMs = Date.now() - startedAt;

      void this.auditService.record({
        requestId: meta.requestId ?? randomUUID(),
        method: 'POST',
        path: '/api/translation/test',
        statusCode: HttpStatus.OK,
        outcome: 'success',
        durationMs: latencyMs,
        action: 'TEST_TRANSLATION_CONNECTION',
        actor: actorEmail,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });

      return {
        ok: true,
        provider: effectiveProvider,
        model: effectiveModel,
        latencyMs,
        message: 'API key and model responded successfully.',
      };
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Network error';
      throw new AppException(
        ErrorCode.SERVICE_UNAVAILABLE,
        HttpStatus.BAD_GATEWAY,
        `Could not reach external LLM endpoint: ${message}`,
      );
    }
  }

  async translate(
    dto: TranslateContentDto,
    actorEmail: string,
    meta: TranslationAuditMeta = {},
  ): Promise<TranslationResult> {
    const settings = await this.getOrCreateSettingsDoc();

    if (!settings.enabled) {
      throw new AppException(
        ErrorCode.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
        'Automatic translation is currently disabled in translation settings.',
      );
    }

    const targetConfigs = this.resolveTargetLanguages(settings, dto.targetLanguages);
    const targetCodes = targetConfigs.map((lang) => lang.code);
    const { isSingleText, normalized } = this.normalizeFieldsInput(dto, targetCodes);

    const effectiveFormat = dto.outputFormat ?? settings.outputFormat;
    const effectiveModel = this.resolveEffectiveModel(settings);

    const fieldsNeedingTranslation = Object.entries(normalized).filter(
      ([, field]) => field.missingLanguages.length > 0,
    );

    if (fieldsNeedingTranslation.length === 0) {
      const resultFields: Record<string, Record<string, string>> = {};
      for (const [key, item] of Object.entries(normalized)) {
        resultFields[key] = item.existing;
      }

      const detected =
        dto.sourceLanguage?.trim().toLowerCase() ??
        Object.keys(Object.values(normalized)[0]?.existing ?? {})[0] ??
        'unknown';

      return {
        detectedSourceLanguage: detected,
        targetLanguages: targetCodes,
        provider: settings.provider,
        model: effectiveModel,
        outputFormat: effectiveFormat,
        fields: resultFields,
        translatedLanguageCount: 0,
      };
    }

    const languageCatalog = targetConfigs
      .map((lang) => `${lang.code} (${lang.name} / ${lang.nativeName})`)
      .join(', ');

    const combinedInstructions = [
      settings.systemPrompt,
      `Output style (${effectiveFormat}): ${FORMAT_GUIDANCE[effectiveFormat]}`,
      settings.customInstructions ? `Admin instructions: ${settings.customInstructions}` : '',
      dto.customInstructions ? `Request instructions: ${dto.customInstructions.trim()}` : '',
      'Return ONLY a strict JSON object with the exact shape: { "detectedSourceLanguage": "<iso-code>", "fields": { "<fieldKey>": { "<langCode>": "<translatedText>" } } }.',
      'For each field, ONLY translate into the exact missingLanguages requested for that field. Do not omit or rename field keys or language codes.',
    ]
      .filter(Boolean)
      .join('\n');

    const promptPayload = {
      sourceLanguageHint: dto.sourceLanguage?.trim().toLowerCase() ?? 'auto-detect',
      targetLanguagesCatalog: languageCatalog,
      items: Object.fromEntries(
        fieldsNeedingTranslation.map(([key, item]) => [
          key,
          {
            sourceText: item.sourceText,
            missingLanguages: item.missingLanguages,
          },
        ]),
      ),
    };

    const llmRaw = (await this.callExternalLlm(
      settings,
      combinedInstructions,
      JSON.stringify(promptPayload),
    )) as LlmStructuredResponse;

    const detectedSourceLanguage =
      typeof llmRaw.detectedSourceLanguage === 'string' &&
      llmRaw.detectedSourceLanguage.trim().length > 0
        ? llmRaw.detectedSourceLanguage.trim().toLowerCase()
        : (dto.sourceLanguage?.trim().toLowerCase() ?? 'unknown');

    const llmFields = isRecord(llmRaw.fields) ? llmRaw.fields : {};

    const finalFields: Record<string, Record<string, string>> = {};
    let translatedCount = 0;

    for (const [key, item] of Object.entries(normalized)) {
      const merged: Record<string, string> = { ...item.existing };
      const generatedForKey = isRecord(llmFields[key]) ? llmFields[key] : {};

      for (const langCode of item.missingLanguages) {
        if (item.mode === 'single' && langCode === detectedSourceLanguage) {
          merged[langCode] = item.sourceText;
          continue;
        }
        const translatedValue = generatedForKey[langCode];
        if (typeof translatedValue === 'string' && translatedValue.trim().length > 0) {
          merged[langCode] = translatedValue.trim();
          translatedCount += 1;
        }
      }

      finalFields[key] = merged;
    }

    void this.auditService.record({
      requestId: meta.requestId ?? randomUUID(),
      method: 'POST',
      path: '/api/translation/translate',
      statusCode: HttpStatus.OK,
      outcome: 'success',
      durationMs: 0,
      action: 'TRANSLATE_CONTENT',
      actor: actorEmail,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    if (isSingleText) {
      return {
        detectedSourceLanguage,
        targetLanguages: targetCodes,
        provider: settings.provider,
        model: effectiveModel,
        outputFormat: effectiveFormat,
        translations: finalFields.text ?? {},
        translatedLanguageCount: translatedCount,
      };
    }

    return {
      detectedSourceLanguage,
      targetLanguages: targetCodes,
      provider: settings.provider,
      model: effectiveModel,
      outputFormat: effectiveFormat,
      fields: finalFields,
      translatedLanguageCount: translatedCount,
    };
  }
}
