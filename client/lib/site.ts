/**
 * Central site identity, navigation links, and shared utility functions.
 */
export const SITE_URL = "https://bajhaw.com";
export const SITE_NAME = "Mohammed Bajhaw";

/** Primary navigation. `key` is the label's message key under "nav"; `href` is locale-less. */
export const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "services", href: "/services" },
] as const;

export function formatPhone(phone: string) {
  return phone.replace(/^(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
}

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(text: string | null | undefined, max = 158) {
  const clean = String(text ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:.\-–]+$/, "")}…`;
}

/** Serialises structured data for a JSON-LD script tag, escaping anything that could close the tag. */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(new RegExp("[\\u2028\\u2029]", "g"), "");
}
