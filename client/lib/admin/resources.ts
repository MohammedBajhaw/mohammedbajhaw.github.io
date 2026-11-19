import { BriefcaseBusiness, FileText, FolderKanban, GraduationCap, LayoutPanelLeft, Trophy, UserRound, Wrench, type LucideIcon } from "lucide-react";
import type { ApiRecord } from "./api";

/**
 * What the content studio knows about each kind of record: where it lives on the API, which fields the form shows,
 * and how a form turns back into the payload the server's validators accept. The console itself stays generic:
 * adding a field here is enough for it to appear in the editor, and for its translations to appear in AR / TR.
 */

export type Lang = "en" | "ar" | "tr";
export type TranslationLang = Exclude<Lang, "en">;
export const LANGS: { code: Lang; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
];
export const TRANSLATION_LANGS: TranslationLang[] = ["ar", "tr"];

export type FieldKind = "text" | "textarea" | "richtext" | "number" | "toggle" | "array" | "lines" | "file" | "date";

export type FieldDefinition = {
  key: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  help?: string;
  /** Shows an optional "Present" shortcut in date pickers (for ongoing end dates). */
  allowPresent?: boolean;
  /** The field has an Arabic and a Turkish version, stored under `translations`. */
  translatable?: boolean;
  /** An empty value is saved as `null` (needed for URL fields, which the server validates strictly). */
  nullable?: boolean;
  required?: boolean;
  /** `file` fields: which uploads the picker accepts. */
  accept?: "image" | "document";
  /** Show next to its neighbour instead of full width. */
  half?: boolean;
};

export type ResourceKey = "profile" | "education" | "experiences" | "skills" | "achievements" | "projects" | "publications" | "services";
export type ResourceExtra = "media" | "services" | "cv_files";

export type ResourceDefinition = {
  key: ResourceKey;
  label: string;
  singular: string;
  group: string;
  icon: LucideIcon;
  /** API path of the collection (or, for `single`, of the one record). */
  endpoint: string;
  /** `paged`: GET returns pages; `list`: GET returns the whole array; `single`: one record, saved with PATCH. */
  shape: "paged" | "list" | "single";
  fields: FieldDefinition[];
  extra?: ResourceExtra;
  emptyMessage: string;
  titleOf: (row: ApiRecord) => string;
  metaOf: (row: ApiRecord) => string;
};

const text = (value: unknown) => (typeof value === "string" ? value : "");
const join = (...parts: unknown[]) => parts.map(text).filter(Boolean).join(" · ");

export const RESOURCES: ResourceDefinition[] = [
  {
    key: "profile",
    label: "Profile",
    singular: "profile",
    group: "Portfolio foundation",
    icon: UserRound,
    endpoint: "/profile",
    shape: "single",
    fields: [
      { key: "name", label: "Full name", placeholder: "Mohammed Bajhaw", translatable: true, required: true, half: true },
      { key: "professional_title", label: "Professional title", placeholder: "Mechatronics Engineer", translatable: true, required: true, half: true },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye", translatable: true, required: true, half: true },
      { key: "email", label: "Contact email", placeholder: "name@example.com", required: true, half: true },
      { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", nullable: true, half: true },
      { key: "github_url", label: "GitHub URL", placeholder: "https://github.com/...", nullable: true, half: true },
      { key: "phone", label: "Phone number", placeholder: "+90...", nullable: true, half: true },
      { key: "bio", label: "Short introduction", kind: "textarea", placeholder: "A concise professional introduction for the home page.", translatable: true, required: true },
      { key: "photo_path", label: "Profile image", kind: "file", accept: "image", nullable: true, help: "Upload a portrait; the path is filled in for you." },
      { key: "photo_alt", label: "Image description", placeholder: "Portrait of Mohammed Bajhaw", nullable: true },
    ],
    extra: "cv_files",
    emptyMessage: "Create your profile first. It is used across the public site.",
    titleOf: (row) => text(row.name) || "Profile",
    metaOf: (row) => text(row.professional_title),
  },
  {
    key: "education",
    label: "Education",
    singular: "education entry",
    group: "Portfolio foundation",
    icon: GraduationCap,
    endpoint: "/profile/education",
    shape: "list",
    fields: [
      { key: "institution", label: "Institution", placeholder: "Fırat University", translatable: true, required: true },
      { key: "degree", label: "Degree", placeholder: "Bachelor’s Degree", translatable: true, required: true, half: true },
      { key: "field", label: "Field of study", placeholder: "Mechatronics Engineering", translatable: true, half: true },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye", translatable: true },
      { key: "start_year", label: "Start year", kind: "date", placeholder: "Select start date", required: true, half: true },
      { key: "end_year", label: "End year", kind: "date", allowPresent: true, placeholder: "Select end date", required: true, half: true },
      { key: "description", label: "Description", kind: "textarea", placeholder: "Optional context about the programme.", translatable: true },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add an education entry to show your academic background.",
    titleOf: (row) => text(row.institution) || "Untitled",
    metaOf: (row) => join(row.degree, row.field, `${text(row.start_year)}–${text(row.end_year)}`),
  },
  {
    key: "experiences",
    label: "Experience",
    singular: "experience",
    group: "Portfolio foundation",
    icon: BriefcaseBusiness,
    endpoint: "/profile/experiences",
    shape: "list",
    fields: [
      { key: "role", label: "Role", placeholder: "Research Assistant", translatable: true, required: true, half: true },
      { key: "organization", label: "Organization", placeholder: "RAI Lab, Fırat University", translatable: true, required: true, half: true },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye", translatable: true },
      { key: "start_date", label: "Start", kind: "date", placeholder: "Select start date", translatable: true, required: true, half: true },
      { key: "end_date", label: "End", kind: "date", allowPresent: true, placeholder: "Select end date", translatable: true, required: true, half: true },
      { key: "is_current", label: "Current position", kind: "toggle", help: "Marks the role as ongoing." },
      { key: "summary", label: "Summary", kind: "textarea", translatable: true },
      { key: "highlights", label: "Highlights", kind: "lines", placeholder: "One highlight per line", translatable: true, help: "One per line, so commas inside a sentence are safe." },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add a role to build the experience timeline.",
    titleOf: (row) => text(row.role) || "Untitled",
    metaOf: (row) => join(row.organization, `${text(row.start_date)} – ${text(row.end_date)}`),
  },
  {
    key: "skills",
    label: "Skills",
    singular: "skill",
    group: "Portfolio foundation",
    icon: Wrench,
    endpoint: "/profile/skills",
    shape: "list",
    fields: [
      { key: "label", label: "Skill", placeholder: "LiDAR SLAM", translatable: true, required: true, half: true },
      { key: "category", label: "Layer", placeholder: "Autonomy & Navigation", required: true, half: true, help: "Skills with the same layer are grouped together. Keep it in English." },
      { key: "icon", label: "Icon name", placeholder: "Radar", half: true },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add skills; each one belongs to a system layer.",
    titleOf: (row) => text(row.label) || "Untitled",
    metaOf: (row) => text(row.category),
  },
  {
    key: "achievements",
    label: "Achievements",
    singular: "achievement",
    group: "Portfolio foundation",
    icon: Trophy,
    endpoint: "/profile/achievements",
    shape: "list",
    fields: [
      { key: "title", label: "Achievement title", placeholder: "3rd Place – Innovation Competition", translatable: true, required: true, half: true },
      { key: "slug", label: "URL slug", placeholder: "innovation-award-2026", required: true, half: true, help: "Used for /achievements/<slug>." },
      { key: "badge", label: "Badge / Eyebrow", placeholder: "2026 Innovation Award", translatable: true, half: true },
      { key: "date", label: "Date / Year", kind: "date", placeholder: "Select date", half: true },
      { key: "organization", label: "Organization", placeholder: "4th Invention and Innovation Conference", translatable: true, half: true },
      { key: "location", label: "Location", placeholder: "Türkiye", translatable: true, half: true },
      { key: "summary", label: "Short summary", kind: "textarea", placeholder: "One-line summary shown on the award card.", translatable: true, required: true },
      { key: "details", label: "Full story / details", kind: "richtext", translatable: true, help: "Shown on the /achievements/[slug] detail page." },
      { key: "image_url", label: "Award / certificate image", kind: "file", accept: "image", nullable: true },
      { key: "project_slug", label: "Related project slug", placeholder: "autonomous-medical-search-rescue-robot", nullable: true, half: true },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
      { key: "featured", label: "Highlight on home page", kind: "toggle", help: "Shown in the About highlights band on the home page." },
    ],
    emptyMessage: "Add awards or achievements to link from About and Home.",
    titleOf: (row) => text(row.title) || "Untitled",
    metaOf: (row) => join(row.badge, row.date),
  },
  {
    key: "projects",
    label: "Projects",
    singular: "project",
    group: "Work",
    icon: FolderKanban,
    endpoint: "/projects",
    shape: "paged",
    extra: "media",
    fields: [
      { key: "title", label: "Project title", placeholder: "Offline AI payload", translatable: true, required: true },
      { key: "slug", label: "Address (slug)", placeholder: "offline-ai-payload", required: true, half: true, help: "Lowercase words joined by hyphens. It is the page address." },
      { key: "status", label: "Status", placeholder: "Ongoing research", translatable: true, required: true, half: true },
      { key: "subtitle", label: "Subtitle", placeholder: "Program or nature of the project", translatable: true },
      { key: "summary", label: "Short summary", kind: "textarea", placeholder: "Shown on cards.", translatable: true, required: true },
      { key: "description", label: "Overview", kind: "textarea", placeholder: "Shown at the top of the project page.", translatable: true, required: true },
      { key: "rich_content", label: "Article", kind: "richtext", placeholder: "Write the project article here.", translatable: true },
      { key: "start_date", label: "Start", kind: "date", placeholder: "Select start date", half: true },
      { key: "end_date", label: "End", kind: "date", allowPresent: true, placeholder: "Select end date", translatable: true, half: true },
      { key: "tags", label: "Tags", kind: "array", placeholder: "ROS 2, LiDAR SLAM, UAVs", translatable: true, help: "Separate tags with commas." },
      { key: "tools", label: "Tools", kind: "lines", placeholder: "One tool per line", translatable: true },
      { key: "outcomes", label: "Outcomes", kind: "lines", placeholder: "One outcome per line", translatable: true, help: "One per line, so commas inside a sentence are safe." },
      { key: "repository_url", label: "Repository URL", placeholder: "https://github.com/...", nullable: true, half: true },
      { key: "publication_url", label: "Related paper", placeholder: "/publications/… or https://…", nullable: true, half: true },
      { key: "featured", label: "Featured", kind: "toggle", help: "Featured projects lead the archive." },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add a project to create its detail page.",
    titleOf: (row) => text(row.title) || "Untitled",
    metaOf: (row) => join(row.status, row.slug),
  },
  {
    key: "publications",
    label: "Publications",
    singular: "publication",
    group: "Work",
    icon: FileText,
    endpoint: "/publications",
    shape: "paged",
    fields: [
      { key: "title", label: "Publication title", kind: "textarea", placeholder: "Full research-paper title", translatable: true, required: true },
      { key: "venue", label: "Conference or journal", placeholder: "IEEE Conference", translatable: true, required: true, half: true },
      { key: "publication_date", label: "Publication date", kind: "date", placeholder: "Select publication date", translatable: true, half: true },
      { key: "status", label: "Type", placeholder: "Journal Article", translatable: true, required: true, half: true },
      { key: "authors", label: "Authors", placeholder: "Author One; Author Two", translatable: true, half: true },
      { key: "doi", label: "DOI", placeholder: "10.1109/example.2026.1234567", half: true, help: "The permanent identifier shown on the paper page." },
      { key: "summary", label: "Short summary", kind: "textarea", placeholder: "Shown on cards.", translatable: true, required: true },
      { key: "details", label: "Abstract and details", kind: "richtext", placeholder: "Full abstract and supporting details.", translatable: true },
      { key: "keywords", label: "Keywords", kind: "array", placeholder: "ROS 2, LiDAR, SLAM", translatable: true, help: "Separate keywords with commas." },
      { key: "url", label: "Paper PDF or link", kind: "file", accept: "document", nullable: true, help: "Upload the PDF, or paste a link." },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add a publication to create a research-detail page.",
    titleOf: (row) => text(row.title) || "Untitled",
    metaOf: (row) => join(row.venue, row.publication_date),
  },
  {
    key: "services",
    label: "Services",
    singular: "service area",
    group: "Work",
    icon: LayoutPanelLeft,
    endpoint: "/services",
    shape: "paged",
    extra: "services",
    fields: [
      { key: "title", label: "Area title", placeholder: "ROS, SLAM & Robot Simulation", translatable: true, required: true },
      { key: "description", label: "Description", kind: "textarea", placeholder: "What this area covers.", translatable: true, required: true },
      { key: "accent", label: "Accent", placeholder: "teal", half: true },
      { key: "icon", label: "Icon name", placeholder: "robotics", half: true },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first.", half: true },
    ],
    emptyMessage: "Add a service area, then the services inside it.",
    titleOf: (row) => text(row.title) || "Untitled",
    metaOf: (row) => {
      const count = Array.isArray(row.services) ? row.services.length : 0;
      return `${count} ${count === 1 ? "service" : "services"}`;
    },
  },
];

export const RESOURCE_GROUPS = Array.from(new Set(RESOURCES.map((resource) => resource.group)));
export const resourceByKey = (key: ResourceKey) => RESOURCES.find((resource) => resource.key === key)!;

/* ------------------------------------------------------------------------------------------------ form state */

export type TranslationValues = Record<TranslationLang, Record<string, string>>;

export type CvFilesByLang = Record<Lang, string>;
export type MediaForm = { storage_path: string; alt: string; sort_order: string; translations: Record<TranslationLang, { alt: string }> };
export type ServiceForm = {
  title: string;
  summary: string;
  deliverables: string;
  sort_order: string;
  translations: Record<TranslationLang, { title: string; summary: string; deliverables: string }>;
};

export type FormState = {
  values: Record<string, string | boolean>;
  translations: TranslationValues;
  media: MediaForm[];
  services: ServiceForm[];
  cvFiles: CvFilesByLang;
};

const emptyTranslations = (): TranslationValues => ({ ar: {}, tr: {} });
const emptyCvFiles = (): CvFilesByLang => ({ en: "", ar: "", tr: "" });

function resolveCvLang(label: string): Lang | null {
  const normalized = label.trim().toLowerCase();
  if (normalized === "en" || normalized.includes("english")) return "en";
  if (normalized === "ar" || normalized.includes("arab") || normalized.includes("العربية")) return "ar";
  if (normalized === "tr" || normalized.includes("turk") || normalized.includes("türkçe")) return "tr";
  return null;
}

export function emptyMedia(): MediaForm {
  return { storage_path: "", alt: "", sort_order: "0", translations: { ar: { alt: "" }, tr: { alt: "" } } };
}
export function emptyService(): ServiceForm {
  return { title: "", summary: "", deliverables: "", sort_order: "0", translations: { ar: { title: "", summary: "", deliverables: "" }, tr: { title: "", summary: "", deliverables: "" } } };
}

function stringify(value: unknown, kind: FieldKind | undefined): string | boolean {
  if (kind === "toggle") return Boolean(value);
  if (kind === "array") return Array.isArray(value) ? value.join(", ") : "";
  if (kind === "lines") return Array.isArray(value) ? value.join("\n") : "";
  if (kind === "number") return value === undefined || value === null ? "0" : String(value);
  return typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
}

export function emptyForm(def: ResourceDefinition): FormState {
  const values: FormState["values"] = {};
  for (const field of def.fields) values[field.key] = stringify(undefined, field.kind);
  return { values, translations: emptyTranslations(), media: [], services: [], cvFiles: emptyCvFiles() };
}

export function rowToForm(def: ResourceDefinition, row: ApiRecord): FormState {
  const form = emptyForm(def);
  for (const field of def.fields) form.values[field.key] = stringify(row[field.key], field.kind);

  const translations = (row.translations ?? {}) as Partial<Record<TranslationLang, Record<string, unknown>>>;
  for (const lang of TRANSLATION_LANGS) {
    for (const field of def.fields) {
      if (!field.translatable) continue;
      const value = translations[lang]?.[field.key];
      if (value !== undefined && value !== null) form.translations[lang][field.key] = String(stringify(value, field.kind));
    }
  }

  if (def.extra === "cv_files" && Array.isArray(row.cv_files)) {
    for (const item of row.cv_files as ApiRecord[]) {
      const file = text(item.file);
      if (!file) continue;
      const targetLang = resolveCvLang(text(item.label)) ?? (!form.cvFiles.en ? "en" : null);
      if (targetLang && !form.cvFiles[targetLang]) form.cvFiles[targetLang] = file;
    }
  }

  if (def.extra === "media" && Array.isArray(row.project_media)) {
    form.media = (row.project_media as ApiRecord[]).map((item) => {
      const itemTranslations = (item.translations ?? {}) as Partial<Record<TranslationLang, { alt?: string }>>;
      return {
        storage_path: text(item.storage_path),
        alt: text(item.alt),
        sort_order: String(item.sort_order ?? 0),
        translations: { ar: { alt: text(itemTranslations.ar?.alt) }, tr: { alt: text(itemTranslations.tr?.alt) } },
      };
    });
  }

  if (def.extra === "services" && Array.isArray(row.services)) {
    form.services = (row.services as ApiRecord[]).map((item) => {
      const itemTranslations = (item.translations ?? {}) as Partial<Record<TranslationLang, { title?: string; summary?: string; deliverables?: string[] }>>;
      const lang = (code: TranslationLang) => ({
        title: text(itemTranslations[code]?.title),
        summary: text(itemTranslations[code]?.summary),
        deliverables: Array.isArray(itemTranslations[code]?.deliverables) ? itemTranslations[code]!.deliverables!.join("\n") : "",
      });
      return {
        title: text(item.title),
        summary: text(item.summary),
        deliverables: Array.isArray(item.deliverables) ? (item.deliverables as string[]).join("\n") : "",
        sort_order: String(item.sort_order ?? 0),
        translations: { ar: lang("ar"), tr: lang("tr") },
      };
    });
  }
  return form;
}

/* --------------------------------------------------------------------------------------------- form → payload */

const splitCommas = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const splitLines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
};

function convert(value: string, kind: FieldKind | undefined): string | string[] {
  if (kind === "array") return splitCommas(value);
  if (kind === "lines") return splitLines(value);
  return value.trim();
}

/** Only what the server's validators know: it rejects unknown properties, so nothing else is sent. */
export function formToPayload(def: ResourceDefinition, form: FormState, mode: "create" | "update"): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of def.fields) {
    const raw = form.values[field.key];
    if (field.kind === "toggle") {
      payload[field.key] = Boolean(raw);
    } else if (field.kind === "number") {
      payload[field.key] = toNumber(String(raw ?? "0"));
    } else if (field.kind === "array" || field.kind === "lines") {
      payload[field.key] = convert(String(raw ?? ""), field.kind);
    } else {
      const value = String(raw ?? "").trim();
      if (value) payload[field.key] = field.kind === "richtext" ? String(raw) : value;
      else if (field.nullable) payload[field.key] = null;
      else if (mode === "update" || field.required) payload[field.key] = "";
    }
  }

  const translations: Record<string, Record<string, unknown>> = {};
  for (const lang of TRANSLATION_LANGS) {
    const entry: Record<string, unknown> = {};
    for (const field of def.fields) {
      if (!field.translatable) continue;
      const value = form.translations[lang][field.key];
      if (typeof value !== "string" || !value.trim()) continue;
      const converted = convert(value, field.kind);
      if (Array.isArray(converted) ? converted.length : converted) entry[field.key] = converted;
    }
    if (Object.keys(entry).length) translations[lang] = entry;
  }
  payload.translations = translations;

  if (def.extra === "cv_files") {
    payload.cv_files = LANGS
      .map((item) => ({ label: item.label, file: form.cvFiles[item.code].trim() }))
      .filter((item) => item.file);
  }

  if (def.extra === "media") {
    payload.project_media = form.media
      .filter((item) => item.storage_path.trim())
      .map((item) => {
        const itemTranslations: Record<string, { alt: string }> = {};
        for (const lang of TRANSLATION_LANGS) if (item.translations[lang].alt.trim()) itemTranslations[lang] = { alt: item.translations[lang].alt.trim() };
        return {
          storage_path: item.storage_path.trim(),
          ...(item.alt.trim() ? { alt: item.alt.trim() } : {}),
          sort_order: toNumber(item.sort_order),
          ...(Object.keys(itemTranslations).length ? { translations: itemTranslations } : {}),
        };
      });
  }

  if (def.extra === "services") {
    payload.services = form.services
      .filter((item) => item.title.trim())
      .map((item) => {
        const itemTranslations: Record<string, Record<string, unknown>> = {};
        for (const lang of TRANSLATION_LANGS) {
          const source = item.translations[lang];
          const entry: Record<string, unknown> = {};
          if (source.title.trim()) entry.title = source.title.trim();
          if (source.summary.trim()) entry.summary = source.summary.trim();
          const deliverables = splitLines(source.deliverables);
          if (deliverables.length) entry.deliverables = deliverables;
          if (Object.keys(entry).length) itemTranslations[lang] = entry;
        }
        return {
          title: item.title.trim(),
          summary: item.summary.trim(),
          deliverables: splitLines(item.deliverables),
          sort_order: toNumber(item.sort_order),
          ...(Object.keys(itemTranslations).length ? { translations: itemTranslations } : {}),
        };
      });
  }

  return payload;
}
