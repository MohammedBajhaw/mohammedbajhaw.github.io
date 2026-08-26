"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { sanitizeProjectRichContent } from "@/lib/richText";

function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/manus-storage/")) return `https://engportfolio-zhkmdjuy.manus.space${path}`;
  return getBrowserSupabase().storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
}

export function ProjectDetailContent({ initialProject, initialProfile, slug }: { initialProject: Record<string, any>; initialProfile: Record<string, any> | null; slug: string }) {
  const [project, setProject] = useState(initialProject);
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    Promise.all([supabase.from("projects").select("*, project_media(*)").eq("slug", slug).maybeSingle(), supabase.from("profiles").select("name").limit(1).maybeSingle()]).then(([nextProject, nextProfile]) => {
      if (nextProject.data) setProject(nextProject.data as Record<string, any>);
      if (nextProfile.data) setProfile(nextProfile.data as Record<string, any>);
    }).catch(() => undefined);
  }, [slug]);

  const media = useMemo(() => [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order), [project.project_media]);
  const richContent = sanitizeProjectRichContent(project.rich_content);
  return <><SiteHeader name={profile?.name ?? "Mohammed Bajhaw"} /><main className="content-page"><section className="project-hero"><div className="shell"><Link className="back-link" href="/projects">← All projects</Link><p className="eyebrow">{project.status}</p><h1>{project.title}</h1><p className="lead">{project.summary}</p><div className="tag-row">{(project.tags ?? []).map((tag: string) => <em key={tag}>{tag}</em>)}</div><div className="project-reference-links">{project.repository_url && <a className="project-source-link" href={project.repository_url} target="_blank" rel="noreferrer">View source on GitHub ↗</a>}{project.publication_url && <a className="project-source-link" href={project.publication_url} target="_blank" rel="noreferrer">Read related publication ↗</a>}</div></div></section><section className="section"><div className="shell detail-grid"><article><p className="index">Overview</p>{String(project.description ?? "").split("\n\n").filter(Boolean).map((paragraph: string) => <p className="detail-copy" key={paragraph}>{paragraph}</p>)}{richContent && <section className="rich-project-body" dangerouslySetInnerHTML={{ __html: richContent }} />}</article><aside className="detail-aside"><p className="index">System stack</p><ul>{(project.tools ?? []).map((tool: string) => <li key={tool}>{tool}</li>)}</ul><p className="index outcomes-label">Outcomes</p><ul>{(project.outcomes ?? []).map((outcome: string) => <li key={outcome}>{outcome}</li>)}</ul></aside></div></section>{media.length > 0 && <section className="section muted"><div className="shell"><p className="index">Media</p><div className="media-grid">{media.map((item) => <figure key={item.id}><img src={mediaUrl(item.storage_path) ?? ""} alt={item.alt ?? project.title} /><figcaption>{item.alt}</figcaption></figure>)}</div></div></section>}</main></>;
}
