import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Content (projects, publications, skills, ...) arrives with an optional `translations` map keyed by locale:
 *   { title: "Robot", translations: { ar: { title: "روبوت" } } }
 * The translated fields are laid over the base record; anything not translated keeps the base (English) value.
 */
function definedOnly(source: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

type Translatable = { translations?: { ar?: object; tr?: object } };

export function localize<T extends Translatable>(entity: T, locale: Locale): T {
  if (!entity || locale === DEFAULT_LOCALE || locale === "en") return entity;
  const override = entity.translations?.[locale];
  return override && typeof override === "object" ? ({ ...entity, ...definedOnly(override as Record<string, unknown>) } as T) : entity;
}

export function localizeAll<T extends Translatable>(entities: T[] | null | undefined, locale: Locale): T[] {
  return (entities ?? []).map((entity) => localize(entity, locale));
}
