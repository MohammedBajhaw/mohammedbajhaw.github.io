import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { HomePortfolioContent } from "@/components/public/HomePortfolioContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE, SITE_URL, SOCIAL_IMAGE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/", absoluteTitle: true });

export default async function HomePage() {
  const portfolio = await getPortfolioSnapshot();
  const profile = portfolio.profile;
  const lab = portfolio.experiences.find((item) => /rai\b|laboratory/i.test(String(item.organization)));
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile?.name ?? SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(SOCIAL_IMAGE),
    jobTitle: profile?.professional_title ?? "Robotics Engineer",
    description: profile?.bio ?? SITE_DESCRIPTION,
    ...(profile?.email ? { email: `mailto:${profile.email}` } : {}),
    ...(profile?.linkedin_url ? { sameAs: [profile.linkedin_url] } : {}),
    alumniOf: portfolio.education.map((item) => ({ "@type": "CollegeOrUniversity", name: item.institution })),
    ...(lab ? { worksFor: { "@type": "Organization", name: lab.organization } } : {}),
    knowsAbout: SITE_KEYWORDS.slice(1),
  };
  const website = { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: SITE_DESCRIPTION, inLanguage: "en", publisher: { "@id": `${SITE_URL}/#person` } };
  return <><JsonLd data={{ "@context": "https://schema.org", "@graph": [person, website] }} /><HomePortfolioContent initialPortfolio={portfolio} /></>;
}
