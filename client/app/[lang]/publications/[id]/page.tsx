import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { PublicationDetailView } from "@/components/views/PublicationDetailView";
import { LOCALES } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { getProfile, getPublicationById, getPublicationIds } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl, truncate } from "@/lib/site";
import type { Publication } from "@/lib/types";

export async function generateStaticParams() {
  const ids = await getPublicationIds();
  return LOCALES.flatMap((lang) => ids.map((id) => ({ lang, id: String(id) })));
}

const authorsOf = (publication: Publication) =>
  String(publication.authors ?? "")
    .split(";")
    .map((name) => name.trim())
    .filter(Boolean);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { locale, t } = await getI18n();
  const publication = await getPublicationById(id, locale);
  if (!publication) return { title: t("meta.publicationNotFound"), robots: { index: false } };
  const other: Record<string, string | string[]> = {
    citation_title: publication.title,
    citation_author: authorsOf(publication),
    ...(publication.publication_date ? { citation_publication_date: String(publication.publication_date) } : {}),
    ...(publication.venue ? { citation_conference_title: publication.venue } : {}),
    ...(publication.doi ? { citation_doi: publication.doi } : {}),
  };
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: publication.title,
    description: truncate(publication.summary ?? publication.details),
    path: `/publications/${id}`,
    type: "article",
    other,
  });
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { locale, t, href } = await getI18n();
  const [publication, profile] = await Promise.all([getPublicationById(id, locale), getProfile(locale)]);
  if (!publication) notFound();
  const data = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    name: publication.title,
    description: truncate(publication.summary ?? publication.details, 300),
    url: absoluteUrl(href(`/publications/${id}`)),
    inLanguage: locale,
    author: authorsOf(publication).map((name) => ({ "@type": "Person", name })),
    ...(publication.publication_date ? { datePublished: String(publication.publication_date) } : {}),
    ...(publication.venue ? { isPartOf: { "@type": "Periodical", name: publication.venue } } : {}),
    ...(publication.doi
      ? {
          identifier: { "@type": "PropertyValue", propertyID: "DOI", value: publication.doi },
          sameAs: [`https://doi.org/${publication.doi}`],
        }
      : {}),
    ...(publication.keywords?.length ? { keywords: publication.keywords.join(", ") } : {}),
    publisher: { "@type": "Organization", name: publication.venue ?? profile.name },
  };
  return (
    <>
      <JsonLd
        data={[
          data,
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbPublications"), path: href("/#publications") },
            { name: publication.title, path: href(`/publications/${id}`) },
          ]),
        ]}
      />
      <PublicationDetailView publication={publication} profile={profile} />
    </>
  );
}
