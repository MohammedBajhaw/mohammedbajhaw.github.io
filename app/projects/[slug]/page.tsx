import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { createPortfolioClient, isSupabaseConfigured, publicMediaUrl } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSupabaseConfigured) notFound();
  const supabase = createPortfolioClient();
  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*, project_media(*)").eq("slug", slug).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  if (!project) notFound();
  const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return <><SiteHeader name={profile?.name ?? "Mohammed Bajhaw"} /><main className="content-page"><section className="project-hero"><div className="shell"><Link className="back-link" href="/projects">← All projects</Link><p className="eyebrow">{project.status}</p><h1>{project.title}</h1><p className="lead">{project.summary}</p><div className="tag-row">{(project.tags ?? []).map((tag: string) => <em key={tag}>{tag}</em>)}</div></div></section><section className="section"><div className="shell detail-grid"><article><p className="index">Overview</p>{String(project.description ?? "").split("\n\n").map((paragraph: string) => <p className="detail-copy" key={paragraph}>{paragraph}</p>)}</article><aside className="detail-aside"><p className="index">System stack</p><ul>{(project.tools ?? []).map((tool: string) => <li key={tool}>{tool}</li>)}</ul><p className="index outcomes-label">Outcomes</p><ul>{(project.outcomes ?? []).map((outcome: string) => <li key={outcome}>{outcome}</li>)}</ul></aside></div></section>{media.length > 0 && <section className="section muted"><div className="shell"><p className="index">Media</p><div className="media-grid">{media.map((item) => <figure key={item.id}><img src={publicMediaUrl(item.storage_path) ?? ""} alt={item.alt ?? project.title} /><figcaption>{item.alt}</figcaption></figure>)}</div></div></section>}</main></>;
}
