import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PublicationDetailContent } from "@/components/public/PublicationDetailContent";
import { createPortfolioClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME, absoluteUrl, truncate } from "@/lib/site";

export async function generateStaticParams() {
  const portfolio = await getPortfolioSnapshot();
  return portfolio.publications.map((publication) => ({ id: String(publication.id) }));
}

async function loadPublication(id: string) {
  const publicationId = Number(id);
  if (!Number.isInteger(publicationId) || !isSupabaseConfigured) return { publication: null, profile: null, publicationId };
  const supabase = createPortfolioClient();
  const [{ data: publication }, { data: profile }] = await Promise.all([
    supabase.from("publications").select("*").eq("id", publicationId).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  return { publication, profile, publicationId };
}

const authorsOf = (publication: Record<string, any>) => String(publication.authors ?? "").split(";").map((name) => name.trim()).filter(Boolean);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { publication } = await loadPublication(id);
  if (!publication) return { title: "Publication not found", robots: { index: false } };
  // Google Scholar and reference managers read these citation_* tags.
  const other: Record<string, string | string[]> = {
    citation_title: publication.title,
    citation_author: authorsOf(publication),
    ...(publication.publication_date ? { citation_publication_date: String(publication.publication_date) } : {}),
    ...(publication.venue ? { citation_conference_title: publication.venue } : {}),
    ...(publication.doi ? { citation_doi: publication.doi } : {}),
  };
  return pageMetadata({ title: publication.title, description: truncate(publication.summary ?? publication.details), path: `/publications/${id}`, type: "article", other });
}

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { publication, profile, publicationId } = await loadPublication(id);
  if (!publication) notFound();
  const data = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: publication.title,
    name: publication.title,
    description: truncate(publication.summary ?? publication.details, 300),
    url: absoluteUrl(`/publications/${id}`),
    inLanguage: "en",
    author: authorsOf(publication).map((name) => ({ "@type": "Person", name })),
    ...(publication.publication_date ? { datePublished: String(publication.publication_date) } : {}),
    ...(publication.venue ? { isPartOf: { "@type": "Periodical", name: publication.venue } } : {}),
    ...(publication.doi ? { identifier: { "@type": "PropertyValue", propertyID: "DOI", value: publication.doi }, sameAs: [`https://doi.org/${publication.doi}`] } : {}),
    ...(publication.keywords?.length ? { keywords: publication.keywords.join(", ") } : {}),
    publisher: { "@type": "Organization", name: publication.venue ?? profile?.name ?? SITE_NAME },
  };
  return <><JsonLd data={[data, breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Publications", path: "/#publications" }, { name: publication.title, path: `/publications/${id}` }])]} /><PublicationDetailContent initialPublication={publication} initialProfile={profile} publicationId={publicationId} /></>;
}
