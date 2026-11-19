import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { AboutView } from "@/components/views/AboutView";
import { getI18n } from "@/lib/i18n/server";
import { getAboutData } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: t("meta.aboutTitle"),
    description: t("meta.aboutDescription"),
    path: "/about",
  });
}

export default async function AboutPage() {
  const { locale, t, href } = await getI18n();
  const data = await getAboutData(locale);
  const profile = data.profile;

  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl(href("/about")),
    name: t("meta.aboutPageName", { name: profile?.name ?? t("meta.siteName") }),
    inLanguage: locale,
    mainEntity: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <JsonLd
        data={[
          profilePage,
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbAbout"), path: href("/about") },
          ]),
        ]}
      />
      <AboutView data={data} />
    </>
  );
}
