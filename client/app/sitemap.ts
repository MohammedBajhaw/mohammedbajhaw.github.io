import type { MetadataRoute } from "next";
import { LOCALES, localePath } from "@/lib/i18n/config";
import { getProjects, getPublicationIds } from "@/lib/services";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

type Entry = { path: string; lastModified?: Date; changeFrequency: "monthly" | "yearly"; priority: number };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, publicationIds] = await Promise.all([getProjects("en"), getPublicationIds()]);
  const now = new Date();

  const entries: Entry[] = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/projects", changeFrequency: "monthly", priority: 0.9 },
    { path: "/services", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    ...projects.map((project): Entry => ({
      path: `/projects/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...publicationIds.map((id): Entry => ({
      path: `/publications/${id}`,
      changeFrequency: "yearly",
      priority: 0.7,
    })),
  ];

  // One URL per locale, each listing its translations (hreflang) so search engines serve the right language.
  return entries.flatMap((entry) => {
    const languages = Object.fromEntries(LOCALES.map((locale) => [locale, absoluteUrl(localePath(locale, entry.path))]));
    return LOCALES.map((locale) => ({
      url: absoluteUrl(localePath(locale, entry.path)),
      lastModified: entry.lastModified ?? now,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages },
    }));
  });
}
