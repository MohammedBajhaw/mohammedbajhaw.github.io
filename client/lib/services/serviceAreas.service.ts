import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localize, localizeAll } from "@/lib/i18n/localize";
import type { ServiceArea } from "@/lib/types";
import { source } from "./source";

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

/** Engineering service areas, each with its translated, ordered services (services page). */
export const getServiceAreas = cache(async (locale: Locale): Promise<ServiceArea[]> => {
  const areas = await source.serviceAreas();
  return areas
    .map((area) => {
      const localized = localize(area, locale);
      return { ...localized, services: localizeAll(localized.services, locale).sort(bySortOrder) };
    })
    .sort(bySortOrder);
});
