"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { dirOf, localePath, type Locale } from "./config";
import { createTranslator, type Messages } from "./translate";

function build(locale: Locale, messages: Messages) {
  const { t, list } = createTranslator(messages);
  return { locale, dir: dirOf(locale), t, list, href: (path?: string) => localePath(locale, path) };
}

type I18nValue = ReturnType<typeof build>;

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => build(locale, messages), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translator, locale and localized-href helper for Client Components. */
export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
