import { cache } from "react";
import { buildGallerySlides } from "@/lib/gallery";
import type { Locale } from "@/lib/i18n/config";
import { localize, localizeAll } from "@/lib/i18n/localize";
import { getAchievements, getProfile } from "./profile.service";
import { getProjects } from "./projects.service";
import { getPublications } from "./publications.service";
import { getServiceAreas } from "./serviceAreas.service";
import { getSkills } from "./skills.service";
import { source } from "./source";
import type { AboutData, ContactData, HomeData, ProjectsPageData, ServicesPageData } from "./types";

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

/**
 * One loader per page: it gathers everything that page shows. Pages call these (never the source) so each
 * page data needs live in one place and the views stay free of fetching logic.
 */
export const getHomeData = cache(async (locale: Locale): Promise<HomeData> => {
  const [profile, projects, publications, skills, achievements] = await Promise.all([
    getProfile(locale),
    getProjects(locale),
    getPublications(locale),
    getSkills(locale),
    getAchievements(locale),
  ]);
  const featuredAchievement = achievements.find((item) => item.featured) ?? achievements[0] ?? null;
  return {
    profile,
    projects,
    publications,
    skills,
    featuredAchievement,
    gallerySlides: buildGallerySlides(projects, publications),
    counts: { projects: projects.length, publications: publications.length, skills: skills.length },
  };
});

export const getAboutData = cache(async (locale: Locale): Promise<AboutData> => {
  const [profile, experiences, education, achievements, projects, publications, skills] = await Promise.all([
    getProfile(locale),
    source.experiences(),
    source.education(),
    getAchievements(locale),
    getProjects(locale),
    getPublications(locale),
    getSkills(locale),
  ]);
  return {
    profile,
    experiences: localizeAll(experiences, locale).sort(bySortOrder),
    education: localizeAll(education, locale).sort(bySortOrder),
    achievements,
    counts: { projects: projects.length, publications: publications.length, skills: skills.length },
  };
});

export const getProjectsPageData = cache(async (locale: Locale): Promise<ProjectsPageData> => {
  const [profile, projects] = await Promise.all([getProfile(locale), getProjects(locale)]);
  return { profile, projects };
});

export const getServicesPageData = cache(async (locale: Locale): Promise<ServicesPageData> => {
  const [profile, serviceAreas] = await Promise.all([getProfile(locale), getServiceAreas(locale)]);
  return { profile, serviceAreas };
});

export const getContactData = cache(async (locale: Locale): Promise<ContactData> => {
  const profile = localize(await source.profile(), locale);
  return {
    profile,
    channels: {
      email: profile.email || "",
      phone: profile.phone || null,
      linkedinUrl: profile.linkedin_url || null,
      githubUrl: profile.github_url || null,
      location: profile.location || "",
    },
  };
});
