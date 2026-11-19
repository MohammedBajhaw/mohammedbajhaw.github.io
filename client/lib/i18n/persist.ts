import { LOCALE_COOKIE, type Locale } from "./config";

/** Remember the visitor's language so the proxy sends them to it next time. Client-only. */
export function persistLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
