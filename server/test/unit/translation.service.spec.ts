import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import type { AuditService } from '@/audit/audit.service';
import type { EnvConfig } from '@/common/config/env.validation';
import { AppException } from '@/common/errors/app.exception';
import { ErrorCode } from '@/common/errors/error-codes';
import { DEFAULT_SUPPORTED_LANGUAGES } from '@/translation/translation.constants';
import { TranslationService } from '@/translation/translation.service';
import type { TranslationSettingsDocument } from '@/translation/translation-settings.schema';

describe('TranslationService (Unit)', () => {
  const baseSettingsDoc = {
    _id: 'settings-id',
    key: 'default',
    enabled: true,
    provider: 'openai_compatible',
    apiBaseUrl: 'https://api.openai.com/v1',
    apiKey: 'sk-test-secret-123456',
    model: 'gpt-4o-mini',
    outputFormat: 'technical',
    systemPrompt: 'Translate accurately.',
    customInstructions: '',
    temperature: 0.2,
    timeoutMs: 15000,
    supportedLanguages: DEFAULT_SUPPORTED_LANGUAGES,
  };

  const mockModel = {
    findOne: () => ({
      exec: () => Promise.resolve(baseSettingsDoc),
    }),
    findByIdAndUpdate: (_id: string, update: { $set: Record<string, unknown> }) => ({
      exec: () => Promise.resolve({ ...baseSettingsDoc, ...update.$set }),
    }),
  } as unknown as Model<TranslationSettingsDocument>;

  const mockConfig = {
    get: () => undefined,
  } as unknown as ConfigService<EnvConfig, true>;

  const mockAuditService = {
    record: () => Promise.resolve(),
  } as unknown as AuditService;

  const service = new TranslationService(mockModel, mockConfig, mockAuditService);

  it('masks apiKey when returning settings', async () => {
    const settings = await service.getSettings();
    assert.equal(settings.hasApiKey, true);
    assert.equal(settings.apiKeyMasked, 'sk-t****3456');
    assert.equal('apiKey' in settings, false);
  });

  it('rejects non-HTTPS external apiBaseUrl (SSRF protection)', async () => {
    await assert.rejects(
      () =>
        service.updateSettings(
          { apiBaseUrl: 'http://169.254.169.254/latest/meta-data' },
          'admin@example.com',
        ),
      (err: unknown) => err instanceof AppException && err.code === ErrorCode.BAD_REQUEST,
    );
  });

  it('auto-detects source language and translates only missing languages', async () => {
    const originalFetch = globalThis.fetch;
    let capturedBody = '';

    globalThis.fetch = ((_url: unknown, init?: RequestInit) => {
      capturedBody = typeof init?.body === 'string' ? init.body : '';
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    detectedSourceLanguage: 'ar',
                    fields: {
                      title: {
                        tr: 'Akıllı Mühendislik',
                      },
                    },
                  }),
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    }) as typeof fetch;

    try {
      const result = await service.translate(
        {
          fields: {
            title: {
              ar: 'هندسة ذكية',
              en: 'Smart Engineering',
            },
          },
        },
        'admin@example.com',
      );

      assert.equal(result.detectedSourceLanguage, 'ar');
      assert.equal(result.fields?.title?.ar, 'هندسة ذكية');
      assert.equal(result.fields?.title?.en, 'Smart Engineering');
      assert.equal(result.fields?.title?.tr, 'Akıllı Mühendislik');
      assert.equal(result.translatedLanguageCount, 1);
      const parsedRequest = JSON.parse(capturedBody) as {
        messages: Array<{ content: string }>;
      };
      const userPromptPayload = JSON.parse(parsedRequest.messages[1]?.content ?? '{}') as {
        items?: { title?: { missingLanguages?: string[] } };
      };
      assert.deepEqual(userPromptPayload.items?.title?.missingLanguages, ['tr']);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
