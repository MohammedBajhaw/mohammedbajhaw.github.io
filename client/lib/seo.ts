import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localePath, type Locale } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";

type PageMeta = {
  locale: Locale;
  siteName: string;
  title: string;
  description: string;
  /** Path without the locale prefix, e.g. "/projects/my-slug". */
  path: string;
  image?: string | null;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  other?: Record<string, string | string[]>;
};

/** hreflang map for a page: every locale plus x-default (English). */
export function alternateLanguages(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, localePath(locale, path)])),
    "x-default": localePath(DEFAULT_LOCALE, path),
  };
}

/** Per-page metadata. Open Graph is not merged by Next, so each page repeats the URL, and its image when it has one. */
export function pageMetadata({ locale, siteName, title, description, path, image, type = "website", absoluteTitle, other }: PageMeta): Metadata {
  const images = image ? [{ url: image, alt: title }] : undefined;
  const fullTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  const url = localePath(locale, path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: alternateLanguages(path) },
    openGraph: {
      type,
      siteName,
      locale: LOCALE_META[locale].ogLocale,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_META[l].ogLocale),
      url,
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: images
      ? { card: "summary_large_image", title: fullTitle, description, images: images.map((item) => item.url) }
      : { card: "summary", title: fullTitle, description },
    ...(other ? { other } : {}),
  };
}

/** `path` values are full (already localized) paths, e.g. "/ar/projects". */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
