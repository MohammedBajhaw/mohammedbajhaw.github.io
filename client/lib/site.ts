/**
 * Central site identity, navigation links, CV files, and shared utility functions.
 */
export const SITE_URL = "https://bajhaw.com";
export const SITE_NAME = "Mohammed Bajhaw";
export const GITHUB_URL = "https://github.com/MohammedBajhaw";

/** Primary navigation. `key` is the label's message key under "nav"; `href` is locale-less. */
export const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "projects", href: "/projects" },
  { key: "services", href: "/services" },
] as const;

export const CV_FILES = [
  { label: "English", file: "/cv/CV_Mohammed_Bajhaw_English.pdf" },
  { label: "Türkçe", file: "/cv/CV_Mohammed_Bajhaw_Turkish.pdf" },
] as const;

export function formatPhone(phone: string) {
  return phone.replace(/^(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
}

export function orgLogo(name?: string | null) {
  if (!name) return null;
  if (/\brai\b|robotics and artificial/i.test(name)) {
    return { src: "/logos/rai-lab.png", alt: "Fırat University Robotics and Artificial Intelligence Laboratory logo" };
  }
  if (/f[ıi]rat/i.test(name)) {
    return { src: "/logos/firat-university.png", alt: "Fırat University logo" };
  }
  return null;
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
