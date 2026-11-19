import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localize, localizeAll } from "@/lib/i18n/localize";
import type { Project } from "@/lib/types";
import { source } from "./source";

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

function localizeProject(project: Project, locale: Locale): Project {
  const localized = localize(project, locale);
  return { ...localized, project_media: localizeAll(localized.project_media, locale).sort(bySortOrder) };
}

/** Every project, translated and ordered (archive page, home grid, gallery). */
export const getProjects = cache(async (locale: Locale): Promise<Project[]> => {
  const projects = await source.projects();
  return projects.map((project) => localizeProject(project, locale)).sort(bySortOrder);
});

/** One project for its detail page, or null when the slug is unknown. */
export async function getProjectBySlug(slug: string, locale: Locale): Promise<Project | null> {
  return (await getProjects(locale)).find((project) => project.slug === slug) ?? null;
}

/** Slugs only, for static generation and the sitemap (no translation needed). */
export async function getProjectSlugs(): Promise<string[]> {
  return (await source.projects()).map((project) => project.slug);
}
