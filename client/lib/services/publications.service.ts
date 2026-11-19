import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localizeAll } from "@/lib/i18n/localize";
import type { Publication } from "@/lib/types";
import { source } from "./source";

/** Every publication, translated and ordered (home section, gallery). */
export const getPublications = cache(async (locale: Locale): Promise<Publication[]> => {
  const publications = localizeAll(await source.publications(), locale);
  return [...publications].sort((a, b) => a.sort_order - b.sort_order);
});

/** One publication for its detail page, or null when the id is unknown. */
export async function getPublicationById(id: string | number, locale: Locale): Promise<Publication | null> {
  return (await getPublications(locale)).find((publication) => String(publication.id) === String(id)) ?? null;
}

/** Ids only, for static generation and the sitemap. */
export async function getPublicationIds(): Promise<Array<string | number>> {
  return (await source.publications()).map((publication) => publication.id);
}
