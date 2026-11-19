import type { Locale } from "./config";
import { mergeMessages, type DeepPartial, type Messages } from "./translate";

/**
 * The single place UI translations are loaded from.
 *
 * Today they are local JSON files. When the backend serves translations, replace the body of
 * `loadLocale` with a request to it; everything else (merge, fallback, rendering) stays the same.
 * English is always loaded as the fallback, so a key missing from the backend still renders.
 */
const loaders: Record<Locale, () => Promise<{ default: unknown }>> = {
  en: () => import("@/messages/en"),
  ar: () => import("@/messages/ar"),
  tr: () => import("@/messages/tr"),
};

async function loadLocale(locale: Locale): Promise<DeepPartial<Messages>> {
  return (await loaders[locale]()).default as DeepPartial<Messages>;
}

export async function getMessages(locale: Locale): Promise<Messages> {
  const english = (await loadLocale("en")) as Messages;
  if (locale === "en") return english;
  return mergeMessages<Messages>(english, await loadLocale(locale));
}
