import type { Metadata } from "next";
import { NotFoundView } from "@/components/views/NotFoundView";
import { getI18n } from "@/lib/i18n/server";
import { getProfile } from "@/lib/services";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("meta.notFoundTitle"), robots: { index: false, follow: false } };
}

export default async function NotFound() {
  const { locale, t, href } = await getI18n();
  const profile = await getProfile(locale);
  return (
    <NotFoundView
      profile={profile}
      homeHref={href("/")}
      projectsHref={href("/projects")}
      labels={{
        eyebrow: t("notFound.eyebrow"),
        title: t("notFound.title"),
        body: t("notFound.body"),
        home: t("notFound.home"),
        projects: t("notFound.projects"),
      }}
    />
  );
}
