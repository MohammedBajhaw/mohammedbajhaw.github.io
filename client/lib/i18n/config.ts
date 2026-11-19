/**
 * Locale configuration shared by the server, the client and the proxy.
 * Only pure values live here (no Next imports) so every layer can import it.
 */
export const LOCALES = ["en", "ar", "tr"] as const;
export type Locale = (typeof LOCALES)[number];
export type Direction = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bajhaw-locale";

export const LOCALE_META: Record<Locale, { label: string; short: string; dir: Direction; ogLocale: string }> = {
  en: { label: "English", short: "EN", dir: "ltr", ogLocale: "en_US" },
  ar: { label: "العربية", short: "AR", dir: "rtl", ogLocale: "ar_AR" },
  tr: { label: "Türkçe", short: "TR", dir: "ltr", ogLocale: "tr_TR" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): Direction {
  return LOCALE_META[locale].dir;
}

const ABSOLUTE = /^([a-z][a-z0-9+.-]*:|#|\/\/)/i;

/** "/projects" -> "/ar/projects", "/" -> "/ar", "/#skills" -> "/ar#skills". External and hash-only links pass through. */
export function localePath(locale: Locale, path = "/"): string {
  if (ABSOLUTE.test(path)) return path;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  const rest = normalised === "/" ? "" : normalised.replace(/^\/(?=[#?])/, "");
  return `/${locale}${rest}`;
}

/** "/ar/projects/x" -> "/projects/x" (used by the language switcher). */
export function stripLocale(pathname: string): string {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (match && isLocale(match[1])) return match[2] || "/";
  return pathname || "/";
}
