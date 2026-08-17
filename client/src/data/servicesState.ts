export type ServiceAreaSummary = { services?: unknown[] | null };

export function hasPublishedServices(areas: ServiceAreaSummary[] | undefined | null) {
  return Boolean(areas?.some((area) => Array.isArray(area.services) && area.services.length > 0));
}
