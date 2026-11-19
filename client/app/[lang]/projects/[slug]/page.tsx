import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProjectDetailView } from "@/components/views/ProjectDetailView";
import { LOCALES } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { getProfile, getProjectBySlug, getProjectSlugs } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl, truncate } from "@/lib/site";
import type { Project } from "@/lib/types";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

function heroImage(project: Project) {
  const media = [...project.project_media].sort((a, b) => a.sort_order - b.sort_order);
  return media[0]?.storage_path ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const project = await getProjectBySlug(slug, locale);
  if (!project) return { title: t("meta.projectNotFound"), robots: { index: false } };
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: project.title,
    description: truncate(project.summary ?? project.description),
    path: `/projects/${slug}`,
    image: heroImage(project),
    type: "article",
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { locale, t, href } = await getI18n();
  const [project, profile] = await Promise.all([getProjectBySlug(slug, locale), getProfile(locale)]);
  if (!project) notFound();
  const image = heroImage(project);
  const data = {
    "@context": "https://schema.org",
    "@type": project.repository_url ? ["CreativeWork", "SoftwareSourceCode"] : "CreativeWork",
    name: project.title,
    headline: project.title,
    description: truncate(project.summary ?? project.description, 300),
    url: absoluteUrl(href(`/projects/${slug}`)),
    inLanguage: locale,
    keywords: [...(project.tags ?? []), ...(project.tools ?? [])].join(", "),
    ...(image ? { image } : {}),
    ...(project.repository_url ? { codeRepository: project.repository_url, sameAs: [project.repository_url] } : {}),
    ...(project.created_at ? { dateCreated: String(project.created_at).slice(0, 10) } : {}),
    ...(project.updated_at ? { dateModified: String(project.updated_at).slice(0, 10) } : {}),
    author: { "@type": "Person", "@id": `${SITE_URL}/#person`, name: profile.name, url: SITE_URL },
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
  };
  return (
    <>
      <JsonLd
        data={[
          data,
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbProjects"), path: href("/projects") },
            { name: project.title, path: href(`/projects/${slug}`) },
          ]),
        ]}
      />
      <ProjectDetailView project={project} profile={profile} />
    </>
  );
}
