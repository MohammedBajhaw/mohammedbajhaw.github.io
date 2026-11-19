import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { ContactView } from "@/components/views/ContactView";
import { getI18n } from "@/lib/i18n/server";
import { getContactData } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: t("meta.contactTitle"),
    description: t("meta.contactDescription"),
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { locale, t, href } = await getI18n();
  const data = await getContactData(locale);

  const contactPage = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: absoluteUrl(href("/contact")),
    name: t("meta.contactPageName", { name: data.profile.name }),
    inLanguage: locale,
    mainEntity: { "@id": `${SITE_URL}/#person` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };

  return (
    <>
      <JsonLd
        data={[
          contactPage,
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbContact"), path: href("/contact") },
          ]),
        ]}
      />
      <ContactView data={data} />
    </>
  );
}
