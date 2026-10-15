import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ProjectDetailContent } from "@/components/public/ProjectDetailContent";
import { createPortfolioClient, isSupabaseConfigured, publicMediaUrl } from "@/lib/supabase/server";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL, absoluteUrl, truncate } from "@/lib/site";

export async function generateStaticParams() {
  const portfolio = await getPortfolioSnapshot();
  return portfolio.projects.map((project) => ({ slug: project.slug }));
}

async function loadProject(slug: string) {
  if (!isSupabaseConfigured) return { project: null, profile: null };
  const supabase = createPortfolioClient();
  const [{ data: project }, { data: profile }] = await Promise.all([
    supabase.from("projects").select("*, project_media(*)").eq("slug", slug).maybeSingle(),
    supabase.from("profiles").select("name").limit(1).maybeSingle(),
  ]);
  return { project, profile };
}

function heroImage(project: Record<string, any>) {
  const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return publicMediaUrl(media[0]?.storage_path);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await loadProject(slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata({ title: project.title, description: truncate(project.summary ?? project.description), path: `/projects/${slug}`, image: heroImage(project), type: "article" });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { project, profile } = await loadProject(slug);
  if (!project) notFound();
  const image = heroImage(project);
  const data = {
    "@context": "https://schema.org",
    "@type": project.repository_url ? ["CreativeWork", "SoftwareSourceCode"] : "CreativeWork",
    name: project.title,
    headline: project.title,
    description: truncate(project.summary ?? project.description, 300),
    url: absoluteUrl(`/projects/${slug}`),
    inLanguage: "en",
    keywords: [...(project.tags ?? []), ...(project.tools ?? [])].join(", "),
    ...(image ? { image } : {}),
    ...(project.repository_url ? { codeRepository: project.repository_url, sameAs: [project.repository_url] } : {}),
    ...(project.created_at ? { dateCreated: String(project.created_at).slice(0, 10) } : {}),
    ...(project.updated_at ? { dateModified: String(project.updated_at).slice(0, 10) } : {}),
    author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: profile?.name ?? SITE_NAME, url: SITE_URL },
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
  };
  return <><JsonLd data={[data, breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }, { name: project.title, path: `/projects/${slug}` }])]} /><ProjectDetailContent initialProject={project} initialProfile={profile} slug={slug} /></>;
}
