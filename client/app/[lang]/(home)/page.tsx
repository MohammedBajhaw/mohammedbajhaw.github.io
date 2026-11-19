import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { HomeView } from "@/components/views/HomeView";
import { getI18n } from "@/lib/i18n/server";
import { getAboutData, getHomeData } from "@/lib/services";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: t("meta.siteTitle"),
    description: t("meta.siteDescription"),
    path: "/",
    absoluteTitle: true,
  });
}

export default async function HomePage() {
  const { locale, t, messages } = await getI18n();
  const [data, about] = await Promise.all([getHomeData(locale), getAboutData(locale)]);
  const profile = data.profile;
  const lab = about.experiences.find((item) => item.is_current && /rai\b|laboratory/i.test(String(item.organization)));
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile?.name ?? t("meta.siteName"),
    url: SITE_URL,
    jobTitle: profile?.professional_title ?? t("meta.jobTitleFallback"),
    description: profile?.bio ?? t("meta.siteDescription"),
    ...(profile?.email ? { email: `mailto:${profile.email}` } : {}),
    sameAs: [...(profile?.linkedin_url ? [profile.linkedin_url] : []), ...(profile?.github_url ? [profile.github_url] : [])],
    alumniOf: about.education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.institution })),
    ...(lab ? { worksFor: { "@type": "Organization", name: lab.organization } } : {}),
    knowsAbout: messages.meta.keywords.slice(1),
  };
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: t("meta.siteName"),
    description: t("meta.siteDescription"),
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#person` },
  };
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [person, website] }} />
      <HomeView data={data} />
    </>
  );
}
