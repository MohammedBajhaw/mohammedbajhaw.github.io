import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localize, localizeAll } from "@/lib/i18n/localize";
import type { Achievement, Profile } from "@/lib/types";
import { source } from "./source";

/** The owner's profile (header, footer, about, contact). */
export const getProfile = cache(async (locale: Locale): Promise<Profile> => localize(await source.profile(), locale));

export const getAchievements = cache(async (locale: Locale): Promise<Achievement[]> => {
  const items = localizeAll(await source.achievements(), locale);
  return [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order);
});

export async function getAchievementBySlug(slug: string, locale: Locale): Promise<Achievement | null> {
  return (await getAchievements(locale)).find((item) => item.slug === slug) ?? null;
}

export async function getAchievementSlugs(): Promise<string[]> {
  return (await source.achievements()).map((item) => item.slug);
}
