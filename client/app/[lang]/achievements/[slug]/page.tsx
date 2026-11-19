import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AchievementDetailView } from "@/components/views/AchievementDetailView";
import { LOCALES } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { getAchievementBySlug, getAchievementSlugs, getProfile } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import { truncate } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAchievementSlugs();
  return LOCALES.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

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
