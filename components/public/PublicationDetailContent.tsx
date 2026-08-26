"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function publicDocumentUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/manus-storage/")) return `https://engportfolio-zhkmdjuy.manus.space${path}`;
  return getBrowserSupabase().storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
}

export function PublicationDetailContent({ initialPublication, initialProfile, publicationId }: { initialPublication: Record<string, any>; initialProfile: Record<string, any> | null; publicationId: number }) {
  const [publication, setPublication] = useState(initialPublication);
  const [profile, setProfile] = useState(initialProfile);
  useEffect(() => {
    const supabase = getBrowserSupabase();
    Promise.all([supabase.from("publications").select("*").eq("id", publicationId).maybeSingle(), supabase.from("profiles").select("name").limit(1).maybeSingle()]).then(([nextPublication, nextProfile]) => {
      if (nextPublication.data) setPublication(nextPublication.data as Record<string, any>);
      if (nextProfile.data) setProfile(nextProfile.data as Record<string, any>);
    }).catch(() => undefined);
  }, [publicationId]);
  const documentUrl = publicDocumentUrl(publication.url);
  const doiUrl = publication.doi ? `https://doi.org/${publication.doi}` : null;
  return <><SiteHeader name={profile?.name ?? "Mohammed Bajhaw"} /><main className="content-page"><section className="project-hero"><div className="shell"><Link className="back-link" href="/">← Home</Link><p className="eyebrow">{publication.status ?? "Publication"}</p><h1>{publication.title}</h1><p className="lead">{publication.summary}</p><div className="publication-meta"><span>{publication.venue}</span><span>{publication.publication_date}</span>{publication.doi && <span>DOI: {publication.doi}</span>}</div></div></section><section className="section"><div className="shell detail-grid"><article><p className="index">Abstract</p><p className="detail-copy">{publication.details ?? publication.summary}</p><p className="index keywords-label">Keywords</p><div className="tag-row">{(publication.keywords ?? []).map((keyword: string) => <em key={keyword}>{keyword}</em>)}</div></article><aside className="detail-aside"><p className="index">Publication details</p><ul><li><strong>Conference</strong>{publication.venue ?? "Venue to be confirmed"}</li><li><strong>Published</strong>{publication.publication_date ?? "Date to be confirmed"}</li><li><strong>Authors</strong>{publication.authors ?? "Authors to be confirmed"}</li>{publication.doi && <li><strong>DOI</strong>{publication.doi}</li>}</ul><div className="publication-actions">{documentUrl && <a className="button primary" href={documentUrl} target="_blank" rel="noreferrer">Open PDF</a>}{doiUrl && <a className="project-source-link" href={doiUrl} target="_blank" rel="noreferrer">View IEEE record ↗</a>}</div></aside></div></section></main></>;
}
