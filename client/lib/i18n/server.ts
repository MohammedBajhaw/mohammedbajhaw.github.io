import { cache } from "react";
import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { dirOf, isLocale, localePath } from "./config";
import { getMessages } from "./messages";
import { createTranslator } from "./translate";

/** Everything a Server Component needs for the current request's locale (read from the `[lang]` root param). */
export const getI18n = cache(async () => {
  const raw = await lang();
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const messages = await getMessages(locale);
  const { t, list } = createTranslator(messages);
  return { locale, dir: dirOf(locale), messages, t, list, href: (path?: string) => localePath(locale, path) };
});
