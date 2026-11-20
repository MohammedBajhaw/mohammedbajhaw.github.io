"use client";

import { useEffect, useState } from "react";
import { Construction, Save } from "lucide-react";
import { ApiError, settingsApi, uploadApi, type LangCode, type PlatformSettings as Settings, type SettingsTranslation } from "@/lib/admin/api";
import { LANGS, type TranslationLang } from "@/lib/admin/resources";
import { translateTexts, type TranslationMap } from "@/lib/admin/translate";
import { FormButton, FormMessage, Input, MediaField, SegmentedControl, Select, Textarea, Toggle } from "@/components/forms";
import { AutoTranslateBar } from "./AutoTranslateBar";
import { HeroImagesEditor } from "./HeroImagesEditor";
import { Card, ConfirmDialog, Eyebrow, Spinner, StatusToast } from "./ui";

const FLAGS = [
  { key: "contactFormEnabled", label: "Contact form", help: "Visitors can send you messages." },
  { key: "projectsEnabled", label: "Projects", help: "The projects page and project details." },
  { key: "publicationsEnabled", label: "Publications", help: "Research papers and their pages." },
  { key: "servicesEnabled", label: "Services", help: "The services page." },
] as const;

const TEXT_KEYS = ["siteName", "siteTagline", "seoTitle", "seoDescription", "maintenanceTitle", "maintenanceMessage"] as const;
type TextKey = (typeof TEXT_KEYS)[number];
type Texts = Record<TextKey, string>;

type Form = {
  siteName: string;
  siteTagline: string;
  defaultLanguage: LangCode;
  logoUrl: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  features: Settings["features"];
  mTitle: string;
  mMessage: string;
  mEta: string;
  mBypass: boolean;
  heroImages: string[];
  heroInterval: string;
  translations: Record<TranslationLang, Texts>;
};

const blankTexts = (): Texts => ({ siteName: "", siteTagline: "", seoTitle: "", seoDescription: "", maintenanceTitle: "", maintenanceMessage: "" });
const texts = (value?: SettingsTranslation): Texts => ({ ...blankTexts(), ...Object.fromEntries(TEXT_KEYS.map((key) => [key, value?.[key] ?? ""])) });

function toForm(s: Settings): Form {
  return {
    siteName: s.siteName ?? "",
    siteTagline: s.siteTagline ?? "",
    defaultLanguage: s.defaultLanguage ?? "en",
    logoUrl: s.logoUrl ?? "",
    faviconUrl: s.faviconUrl ?? "",
    seoTitle: s.seo?.defaultTitle ?? "",
    seoDescription: s.seo?.defaultDescription ?? "",
    ogImageUrl: s.seo?.ogImageUrl ?? "",
    features: s.features ?? { contactFormEnabled: true, projectsEnabled: true, publicationsEnabled: true, servicesEnabled: true },
    mTitle: s.maintenance?.title ?? "",
    mMessage: s.maintenance?.message ?? "",
    mEta: s.maintenance?.estimatedReturnAt ?? "",
    mBypass: s.maintenance?.allowAdminBypass ?? true,
    heroImages: s.hero?.images ?? [],
    heroInterval: String(s.hero?.intervalSeconds ?? 6),
    translations: { ar: texts(s.translations?.ar), tr: texts(s.translations?.tr) },
  };
}

/** The English source of each translatable text, so the translation service has something to work from. */
const sourceOf = (form: Form): Texts => ({
  siteName: form.siteName,
  siteTagline: form.siteTagline,
  seoTitle: form.seoTitle,
  seoDescription: form.seoDescription,
  maintenanceTitle: form.mTitle,
  maintenanceMessage: form.mMessage,
});

const LABELS: Record<TextKey, string> = {
  siteName: "Site name",
  siteTagline: "Tagline",
  seoTitle: "Search title",
  seoDescription: "Search description",
  maintenanceTitle: "Maintenance title",
  maintenanceMessage: "Maintenance message",
};

/** Site identity, search appearance, feature switches, the maintenance screen and its Arabic / Turkish wording. */
export function PlatformSettings() {
  const [form, setForm] = useState<Form | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusTick, setFocusTick] = useState(0);
  const [lang, setLang] = useState<LangCode>("en");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    let active = true;
    settingsApi
      .get()
      .then((data) => {
        if (!active) return;
        const next = toForm(data);
        setForm(next);
        setBaseline(JSON.stringify(next));
        setMaintenanceOn(Boolean(data.maintenance?.enabled));
      })
      .catch((failure: unknown) => {
        if (active) setLoadError(failure instanceof ApiError ? failure.readable : "Could not load the settings.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focusTick) return;
    const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!first) return;
    first.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    first.focus({ preventScroll: true });
  }, [focusTick]);

  const dirty = form !== null && JSON.stringify(form) !== baseline;
  const patch = (change: Partial<Form>, key?: string) => {
    if (key) setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)));
    setForm((current) => (current ? { ...current, ...change } : current));
  };
  const setText = (code: TranslationLang, key: TextKey, value: string) =>
    setForm((current) => (current ? { ...current, translations: { ...current.translations, [code]: { ...current.translations[code], [key]: value } } } : current));

  async function save() {
    if (!form) return;
    const problems: Record<string, string> = {};
    if (!form.siteName.trim()) problems.siteName = "Site name is required.";
    if (!form.seoTitle.trim()) problems.seoTitle = "Search title is required.";
    if (!form.seoDescription.trim()) problems.seoDescription = "Search description is required.";
    if (!form.mTitle.trim()) problems.mTitle = "Maintenance title is required.";
    if (!form.mMessage.trim()) problems.mMessage = "Maintenance message is required.";
    const seconds = Number(form.heroInterval);
    if (form.heroImages.length > 1 && (!Number.isInteger(seconds) || seconds < 3 || seconds > 60)) problems.heroInterval = "Use a whole number from 3 to 60.";
    if (Object.keys(problems).length) {
      setLang("en");
      setErrors(problems);
      setError("");
      setNotice("");
      setFocusTick((tick) => tick + 1);
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    setErrors({});
    try {
      const saved = await settingsApi.update({
        siteName: form.siteName,
        siteTagline: form.siteTagline,
        defaultLanguage: form.defaultLanguage,
        logoUrl: form.logoUrl,
        faviconUrl: form.faviconUrl,
        seo: { defaultTitle: form.seoTitle, defaultDescription: form.seoDescription, ogImageUrl: form.ogImageUrl },
        features: form.features,
        hero: { images: form.heroImages, intervalSeconds: Number.isInteger(seconds) && seconds >= 3 && seconds <= 60 ? seconds : 6 },
        maintenance: { title: form.mTitle, message: form.mMessage, estimatedReturnAt: form.mEta, allowAdminBypass: form.mBypass },
        translations: { ar: form.translations.ar, tr: form.translations.tr },
      });
      const next = toForm(saved);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setNotice("Settings saved.");
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  async function switchMaintenance(enabled: boolean) {
    if (!form) return;
    setSwitching(true);
    setError("");
    setNotice("");
    try {
      const reply = await settingsApi.setMaintenance({
        enabled,
        ...(form.mTitle.trim() ? { title: form.mTitle } : {}),
        ...(form.mMessage.trim() ? { message: form.mMessage } : {}),
        estimatedReturnAt: form.mEta,
      });
      setMaintenanceOn(reply.enabled);
      setNotice(reply.enabled ? "Maintenance mode is ON. Visitors now see the maintenance screen." : "Maintenance mode is off. The site is open to visitors again.");
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Could not change maintenance mode.");
    } finally {
      setSwitching(false);
      setConfirmMaintenance(false);
    }
  }

  async function autoTranslate(langs: TranslationLang[], overwrite: boolean) {
    if (!form) return 0;
    const existing: TranslationMap = { ar: { ...form.translations.ar }, tr: { ...form.translations.tr } };
    const { result, count } = await translateTexts(sourceOf(form), existing, langs, overwrite);
    setForm((current) => {
      if (!current) return current;
      const next = { ...current, translations: { ar: { ...current.translations.ar }, tr: { ...current.translations.tr } } };
      for (const code of langs) for (const [key, value] of Object.entries(result[code])) next.translations[code][key as TextKey] = value;
      return next;
    });
    return count;
  }

  const translating = lang !== "en";
  const dir = LANGS.find((item) => item.code === lang)?.dir ?? "ltr";
  const code = lang as TranslationLang;
  const english = form ? sourceOf(form) : blankTexts();
  /** A field of the translated copy: shows the English text as the hint. */
  const translated = (key: TextKey, multiline = false) =>
    form &&
    (multiline ? (
      <Textarea tone="white" label={LABELS[key]} dir={dir} rows={3} value={form.translations[code][key]} onChange={(event) => setText(code, key, event.target.value)} placeholder={english[key] ? `English: ${english[key]}` : ""} />
    ) : (
      <Input tone="white" label={LABELS[key]} dir={dir} value={form.translations[code][key]} onChange={(event) => setText(code, key, event.target.value)} placeholder={english[key] ? `English: ${english[key]}` : ""} />
    ));

  return (
    <div className="grid gap-5 lg:gap-6">
      <header>
        <Eyebrow>Platform</Eyebrow>
        <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Platform settings</h1>
        <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">Site identity, how search engines see it, which sections are open, and the maintenance screen.</p>
      </header>

      {loadError && <FormMessage tone="error">{loadError}</FormMessage>}
      {!form && !loadError && <Spinner label="Loading settings" />}

      {form && (
        <>
          <Card className={`grid gap-5 ${maintenanceOn ? "bg-[#fff6e6]!" : ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className={`grid size-12 place-items-center rounded-full ${maintenanceOn ? "bg-[#f6dcae] text-[#8a5a12]" : "bg-[#eef5f3] text-teal"}`}>
                  <Construction size={22} aria-hidden="true" />
                </span>
                <div>
                  <Eyebrow>Maintenance mode</Eyebrow>
                  <p className="m-0 mt-1 font-sans text-[18px] font-bold text-[#0f2422]">{maintenanceOn ? "The site is in maintenance" : "The site is open"}</p>
                </div>
              </div>
              <FormButton variant={maintenanceOn ? "primary" : "danger"} busy={switching} onClick={() => (maintenanceOn ? void switchMaintenance(false) : setConfirmMaintenance(true))}>
                {maintenanceOn ? "Reopen the site" : "Turn on maintenance"}
              </FormButton>
            </div>
            <p className="m-0 font-sans text-[14px] leading-[1.65] text-[#526563]">The switch applies immediately. The wording below is what visitors read, and it is saved with the rest of the settings.</p>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Input id="m-title" label="Title *" error={errors.mTitle} tone="white" value={form.mTitle} onChange={(event) => patch({ mTitle: event.target.value }, "mTitle")} maxLength={160} />
              <Input id="m-eta" label="Expected back" help="Free text, for example “Back at 18:00 UTC”." tone="white" value={form.mEta} onChange={(event) => patch({ mEta: event.target.value })} maxLength={100} />
              <Textarea id="m-message" label="Message *" error={errors.mMessage} tone="white" wide rows={3} value={form.mMessage} onChange={(event) => patch({ mMessage: event.target.value }, "mMessage")} maxLength={1000} />
              <div className="sm:col-span-2">
                <Toggle tone="white" checked={form.mBypass} onChange={(value) => patch({ mBypass: value })} label="Let the signed-in admin through" help="You keep seeing the real site while visitors see the maintenance screen." />
              </div>
            </div>
          </Card>

          <Card className="grid gap-5">
            <Eyebrow>Home page hero</Eyebrow>
            <HeroImagesEditor
              images={form.heroImages}
              interval={form.heroInterval}
              intervalError={errors.heroInterval}
              onImages={(heroImages) => patch({ heroImages })}
              onInterval={(heroInterval) => patch({ heroInterval }, "heroInterval")}
              onError={setError}
            />
          </Card>

          <Card className="grid gap-5">
            <Eyebrow>Identity</Eyebrow>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Input id="site-name" label="Site name *" error={errors.siteName} value={form.siteName} onChange={(event) => patch({ siteName: event.target.value }, "siteName")} maxLength={160} />
              <Select label="Default language" help="The language visitors land on first." value={form.defaultLanguage} onChange={(event) => patch({ defaultLanguage: event.target.value as LangCode })} options={LANGS.map((item) => ({ value: item.code, label: item.label }))} />
              <Input label="Tagline" wide value={form.siteTagline} onChange={(event) => patch({ siteTagline: event.target.value })} maxLength={250} />
              <MediaField label="Logo" value={form.logoUrl} onChange={(logoUrl) => patch({ logoUrl })} upload={uploadApi.upload} onError={setError} maxSizeMB={50} />
              <MediaField label="Favicon" value={form.faviconUrl} onChange={(faviconUrl) => patch({ faviconUrl })} upload={uploadApi.upload} onError={setError} maxSizeMB={50} />
            </div>
          </Card>

          <Card className="grid gap-5">
            <Eyebrow>Search appearance</Eyebrow>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Input id="seo-title" label="Title *" error={errors.seoTitle} wide value={form.seoTitle} onChange={(event) => patch({ seoTitle: event.target.value }, "seoTitle")} maxLength={160} />
              <Textarea id="seo-description" label="Description *" error={errors.seoDescription} wide rows={3} value={form.seoDescription} onChange={(event) => patch({ seoDescription: event.target.value }, "seoDescription")} maxLength={500} showCount />
              <MediaField label="Share image" help="Shown when the site is shared in a message or on social media." wide value={form.ogImageUrl} onChange={(ogImageUrl) => patch({ ogImageUrl })} upload={uploadApi.upload} onError={setError} maxSizeMB={50} />
            </div>
          </Card>

          <Card className="grid gap-4">
            <Eyebrow>Sections</Eyebrow>
            <div className="grid gap-3 sm:grid-cols-2">
              {FLAGS.map((flag) => (
                <Toggle key={flag.key} checked={form.features[flag.key]} onChange={(value) => patch({ features: { ...form.features, [flag.key]: value } })} label={flag.label} help={flag.help} />
              ))}
            </div>
          </Card>

          <Card className="grid gap-5">
            <div>
              <Eyebrow>Wording in other languages</Eyebrow>
              <p className="m-0 mt-2 font-sans text-[14px] leading-[1.65] text-[#526563]">Site name, tagline, search text and the maintenance screen, in Arabic and Turkish.</p>
            </div>
            <AutoTranslateBar
              current={translating ? code : "en"}
              onTranslate={autoTranslate}
              onError={(message) => {
                setNotice("");
                setError(message);
              }}
              onDone={(message) => {
                setError("");
                setNotice(message);
              }}
            />
            <SegmentedControl role="tabs" label="Language" value={lang} onChange={setLang} options={LANGS.map((item) => ({ value: item.code, label: item.label }))} />
            {translating ? (
              <div className="grid gap-x-5 gap-y-5 rounded-[22px] bg-[#f4f8f7] p-4 sm:grid-cols-2 sm:p-5">
                {translated("siteName")}
                {translated("siteTagline")}
                {translated("seoTitle")}
                <span className="hidden sm:block" />
                <div className="grid gap-5 sm:col-span-2">
                  {translated("seoDescription", true)}
                  {translated("maintenanceTitle")}
                  {translated("maintenanceMessage", true)}
                </div>
              </div>
            ) : (
              <p className="m-0 font-sans text-[13.5px] leading-[1.6] text-[#526563]">English is edited in the sections above. Choose Arabic or Turkish to write or review their versions.</p>
            )}
          </Card>

          <div className="sticky bottom-4 z-10 inline-flex w-fit justify-self-start flex-wrap items-center gap-3 rounded-full bg-white/90 p-2 shadow-[0_14px_36px_rgba(16,41,39,0.14)] backdrop-blur-md">
            <FormButton busy={saving} disabled={!dirty} icon={<Save size={16} aria-hidden="true" />} onClick={() => void save()}>
              {saving ? "Saving…" : "Save settings"}
            </FormButton>
            {dirty && <span className="font-sans text-[12.5px] font-bold text-[#b0651d]">Unsaved changes</span>}
          </div>
        </>
      )}

      {confirmMaintenance && (
        <ConfirmDialog
          icon={<Construction size={20} aria-hidden="true" />}
          title="Turn on maintenance mode?"
          body="Visitors will see the maintenance screen instead of the site until you reopen it."
          confirmLabel="Turn on maintenance"
          busy={switching}
          onConfirm={() => void switchMaintenance(true)}
          onCancel={() => setConfirmMaintenance(false)}
        />
      )}

      <StatusToast error={error} notice={notice} />
    </div>
  );
}
