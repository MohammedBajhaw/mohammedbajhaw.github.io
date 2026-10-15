import type { MetadataRoute } from "next";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

function lastModified(value: unknown) {
  const date = value ? new Date(String(value)) : null;
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolio = await getPortfolioSnapshot();
  const latest = [...portfolio.projects, ...portfolio.publications].map((row) => lastModified(row.updated_at ?? row.created_at)).filter(Boolean) as Date[];
  const newest = latest.length ? new Date(Math.max(...latest.map((date) => date.getTime()))) : undefined;
  return [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/projects"), lastModified: newest, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services"), changeFrequency: "yearly", priority: 0.6 },
    ...portfolio.projects.map((project) => ({ url: absoluteUrl(`/projects/${project.slug}`), lastModified: lastModified(project.updated_at ?? project.created_at), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...portfolio.publications.map((publication) => ({ url: absoluteUrl(`/publications/${publication.id}`), lastModified: lastModified(publication.updated_at ?? publication.created_at), changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
