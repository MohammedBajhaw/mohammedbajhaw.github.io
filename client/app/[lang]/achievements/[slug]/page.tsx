import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AchievementDetailView } from "@/components/views/AchievementDetailView";
import { getI18n } from "@/lib/i18n/server";
import { getAchievementBySlug, getProfile } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import { truncate } from "@/lib/site";

// The record is read from the API on every request: an unknown slug is a 404, and edits in the studio show up at once.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const achievement = await getAchievementBySlug(slug, locale);
  if (!achievement) {
    return { title: t("meta.siteName"), robots: { index: false } };
  }
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: achievement.title,
    description: truncate(achievement.summary),
    path: `/achievements/${slug}`,
    type: "article",
  });
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { locale } = await getI18n();
  const [achievement, profile] = await Promise.all([
    getAchievementBySlug(slug, locale),
    getProfile(locale),
  ]);
  if (!achievement) notFound();
  return <AchievementDetailView achievement={achievement} profile={profile} />;
}
