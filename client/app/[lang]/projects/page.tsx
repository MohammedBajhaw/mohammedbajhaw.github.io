import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { ProjectsArchiveView } from "@/components/views/ProjectsArchiveView";
import { getI18n } from "@/lib/i18n/server";
import { getProjectsPageData } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: t("meta.projectsTitle"),
    description: t("meta.projectsDescription"),
    path: "/projects",
  });
}

export default async function ProjectsPage() {
  const { locale, t, href } = await getI18n();
  const data = await getProjectsPageData(locale);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("meta.projectsListName"),
    itemListElement: data.projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: absoluteUrl(href(`/projects/${project.slug}`)),
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbProjects"), path: href("/projects") },
          ]),
        ]}
      />
      <ProjectsArchiveView data={data} />
    </>
  );
}
