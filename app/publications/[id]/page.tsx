import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { createPortfolioClient, isSupabaseConfigured, publicDocumentUrl } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const publicationId = Number(id);
  if (!Number.isInteger(publicationId) || !isSupabaseConfigured) notFound();
  const supabase = createPortfolioClient();
  const [{ data: publication }, { data: profile }] = await Promise.all([
    supabase.from("publications").select("*").eq("id", publicationId).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  if (!publication) notFound();
  const documentUrl = publicDocumentUrl(publication.url);
  return <><SiteHeader name={profile?.name ?? "Mohammed Bajhaw"} /><main className="content-page"><section className="project-hero"><div className="shell"><Link className="back-link" href="/">← Home</Link><p className="eyebrow">{publication.status ?? "Publication"}</p><h1>{publication.title}</h1><p className="lead">{publication.summary}</p><div className="publication-meta"><span>{publication.venue}</span><span>{publication.publication_date}</span><span>{publication.authors}</span></div></div></section><section className="section"><div className="shell detail-grid"><article><p className="index">Abstract</p><p className="detail-copy">{publication.details ?? publication.summary}</p><p className="index keywords-label">Keywords</p><div className="tag-row">{(publication.keywords ?? []).map((keyword: string) => <em key={keyword}>{keyword}</em>)}</div></article><aside className="detail-aside"><p className="index">Publication details</p><ul><li>{publication.venue ?? "Venue to be confirmed"}</li><li>{publication.publication_date ?? "Date to be confirmed"}</li><li>{publication.authors ?? "Authors to be confirmed"}</li></ul>{documentUrl && <a className="button primary" href={documentUrl} target="_blank" rel="noreferrer">Open PDF</a>}</aside></div></section></main></>;
}
