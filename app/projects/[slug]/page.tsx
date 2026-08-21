import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { createPortfolioClient, isSupabaseConfigured, publicMediaUrl } from "@/lib/supabase/server";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { sanitizeProjectRichContent } from "@/lib/richText";

export async function generateStaticParams() {
  const portfolio = await getPortfolioSnapshot();
  return portfolio.projects.map((project) => ({ slug: project.slug }));
}

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
  const richContent = sanitizeProjectRichContent(project.rich_content);
  return <><SiteHeader name={profile?.name ?? "Mohammed Bajhaw"} /><main className="content-page"><section className="project-hero"><div className="shell"><Link className="back-link" href="/projects">← All projects</Link><p className="eyebrow">{project.status}</p><h1>{project.title}</h1><p className="lead">{project.summary}</p><div className="tag-row">{(project.tags ?? []).map((tag: string) => <em key={tag}>{tag}</em>)}</div><div className="project-reference-links">{project.repository_url && <a className="project-source-link" href={project.repository_url} target="_blank" rel="noreferrer">View source on GitHub ↗</a>}{project.publication_url && <a className="project-source-link" href={project.publication_url} target="_blank" rel="noreferrer">Read related publication ↗</a>}</div></div></section><section className="section"><div className="shell detail-grid"><article><p className="index">Overview</p>{String(project.description ?? "").split("\n\n").filter(Boolean).map((paragraph: string) => <p className="detail-copy" key={paragraph}>{paragraph}</p>)}{richContent && <section className="rich-project-body" dangerouslySetInnerHTML={{ __html: richContent }} />}</article><aside className="detail-aside"><p className="index">System stack</p><ul>{(project.tools ?? []).map((tool: string) => <li key={tool}>{tool}</li>)}</ul><p className="index outcomes-label">Outcomes</p><ul>{(project.outcomes ?? []).map((outcome: string) => <li key={outcome}>{outcome}</li>)}</ul></aside></div></section>{media.length > 0 && <section className="section muted"><div className="shell"><p className="index">Media</p><div className="media-grid">{media.map((item) => <figure key={item.id}><img src={publicMediaUrl(item.storage_path) ?? ""} alt={item.alt ?? project.title} /><figcaption>{item.alt}</figcaption></figure>)}</div></div></section>}</main></>;
}
