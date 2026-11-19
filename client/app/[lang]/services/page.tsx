import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { ServicesView } from "@/components/views/ServicesView";
import { getI18n } from "@/lib/i18n/server";
import { getServicesPageData } from "@/lib/services";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return pageMetadata({
    locale,
    siteName: t("meta.siteName"),
    title: t("meta.servicesTitle"),
    description: t("meta.servicesDescription"),
    path: "/services",
  });
}

export default async function ServicesPage() {
  const { locale, t, href } = await getI18n();
  const data = await getServicesPageData(locale);

  const services = data.serviceAreas.flatMap((area) =>
    area.services.map((service) => ({
      "@type": "Service",
      name: service.title,
      description: service.summary,
      serviceType: area.title,
      url: absoluteUrl(href("/services")),
      provider: { "@id": `${SITE_URL}/#person`, "@type": "Person", name: data.profile.name },
    })),
  );

  return (
    <>
      <JsonLd
        data={[
          ...services.map((service) => ({ "@context": "https://schema.org", ...service })),
          breadcrumbJsonLd([
            { name: t("meta.breadcrumbHome"), path: href("/") },
            { name: t("meta.breadcrumbServices"), path: href("/services") },
          ]),
        ]}
      />
      <ServicesView data={data} />
    </>
  );
}
