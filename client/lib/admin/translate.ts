import { translationApi } from "./api";
import type { TranslationLang } from "./resources";

export type TranslationMap = Record<TranslationLang, Record<string, string>>;

const CHUNK = 30; // the server accepts at most 30 fields per request

/**
 * Translates English texts into the chosen languages through the server's translation service.
 * `source` maps a key to its English text; `existing` holds what is already translated. Unless `overwrite` is set,
 * the server only fills the languages still empty, so hand-written translations are never replaced.
 * Returns only the texts that came back, keyed the same way.
 */
export async function translateTexts(source: Record<string, string>, existing: TranslationMap, langs: TranslationLang[], overwrite: boolean): Promise<{ result: TranslationMap; count: number }> {
  const keys = Object.keys(source).filter((key) => source[key]?.trim());
  const result: TranslationMap = { ar: {}, tr: {} };
  let count = 0;

  for (let start = 0; start < keys.length; start += CHUNK) {
    const fields: Record<string, Record<string, string>> = {};
    for (const key of keys.slice(start, start + CHUNK)) {
      fields[key] = { en: source[key]! };
      if (!overwrite) for (const lang of langs) if (existing[lang][key]?.trim()) fields[key]![lang] = existing[lang][key]!;
    }
    const reply = await translationApi.translate({ fields, sourceLanguage: "en", targetLanguages: langs });
    count += reply.translatedLanguageCount;
    for (const [key, byLang] of Object.entries(reply.fields)) for (const lang of langs) if (byLang[lang]?.trim()) result[lang][key] = byLang[lang]!;
  }
  return { result, count };
}
