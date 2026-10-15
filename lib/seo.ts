import type { Metadata } from "next";
import { SITE_NAME, SOCIAL_IMAGE, absoluteUrl } from "@/lib/site";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  other?: Record<string, string | string[]>;
};

/** Per-page metadata. Open Graph is not merged by Next, so each page repeats the image and URL. */
export function pageMetadata({ title, description, path, image, type = "website", absoluteTitle, other }: PageMeta): Metadata {
  const images = [{ url: image || SOCIAL_IMAGE, ...(image ? {} : { width: 1200, height: 630 }), alt: title }];
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: SITE_NAME, locale: "en_US", url: path, title: fullTitle, description, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: images.map((item) => item.url) },
    ...(other ? { other } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
