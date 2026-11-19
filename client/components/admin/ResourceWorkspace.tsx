"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Plus, Save, Search, Sparkles, Trash2 } from "lucide-react";
import { ApiError, resourceApi, type ApiRecord } from "@/lib/admin/api";
import { translateTexts, type TranslationMap } from "@/lib/admin/translate";
import { AutoTranslateBar } from "./AutoTranslateBar";
import {
  LANGS,
  TRANSLATION_LANGS,
  emptyForm,
  formToPayload,
  rowToForm,
  type FormState,
  type Lang,
  type ResourceDefinition,
  type TranslationLang,
} from "@/lib/admin/resources";
import { CvFilesManager } from "./CvFilesManager";
import { FieldRenderer } from "./FieldRenderer";
import { MediaManager } from "./MediaManager";
import { ServicesEditor } from "./ServicesEditor";
import { FormButton, FormMessage, Input, SegmentedControl } from "@/components/forms";
import { Card, ConfirmDialog, Eyebrow, Spinner, StatusToast } from "./ui";

type Selection = string | "new" | null;

const hasLang = (form: FormState, lang: TranslationLang) =>
  Object.values(form.translations[lang]).some((value) => value.trim()) ||
  Boolean(form.cvFiles[lang]?.trim()) ||
  form.media.some((item) => item.translations[lang].alt.trim()) ||
  form.services.some((item) => Object.values(item.translations[lang]).some((value) => value.trim()));

/**
 * The generic list-and-editor screen the original studio was built around: pick a record on the left, edit it on the right.
 * Everything specific to a kind of record (endpoint, fields, payload) comes from its ResourceDefinition.
 */
export function ResourceWorkspace({ def }: { def: ResourceDefinition }) {
  const [rows, setRows] = useState<ApiRecord[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selection, setSelection] = useState<Selection>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  // Problems found in a field are shown on that field, and the page scrolls to the first (topmost) one.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serviceErrors, setServiceErrors] = useState<Record<number, { title?: string; summary?: string }>>({});
  const [focusTick, setFocusTick] = useState(0);

  const isSingle = def.shape === "single";
  const translatable = def.fields.some((field) => field.translatable) || def.extra === "media" || def.extra === "services";
  const Icon = def.icon;

  function open(row: ApiRecord | null) {
    const next = row ? rowToForm(def, row) : emptyForm(def);
    setForm(next);
    setBaseline(JSON.stringify(next));
    setSelection(row ? String(row.id ?? "single") : "new");
    setNotice("");
    setError("");
    setFieldErrors({});
    setServiceErrors({});
  }

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!focusTick) return;
    // DOM order is page order, so the first invalid control is the topmost one.
    const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!first) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    first.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
    first.focus({ preventScroll: true });
  }, [focusTick]);

  useEffect(() => {
    let active = true;
    const read = async (): Promise<ApiRecord[]> => {
      if (def.shape === "paged") return resourceApi.listAll(def.endpoint);
      if (def.shape === "list") return resourceApi.list(def.endpoint);
      try {
        return [await resourceApi.get(def.endpoint)];
      } catch (failure) {
        if (failure instanceof ApiError && failure.status === 404) return [];
        throw failure;
      }
    };
    read()
      .then((items) => {
        if (!active) return;
        setRows(items);
        if (def.shape === "single") {
          const next = items[0] ? rowToForm(def, items[0]) : emptyForm(def);
          setForm(next);
          setBaseline(JSON.stringify(next));
          setSelection(items[0] ? String(items[0].id ?? "single") : "new");
        }
      })
      .catch((failure: unknown) => {
        if (active) setLoadError(failure instanceof ApiError ? failure.readable : "Could not load the records.");
      });
    return () => {
      active = false;
    };
  }, [def]);

  const dirty = form !== null && JSON.stringify(form) !== baseline;
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!rows || !needle) return rows ?? [];
    return rows.filter((row) => `${def.titleOf(row)} ${def.metaOf(row)}`.toLowerCase().includes(needle));
  }, [rows, query, def]);

  const clearFieldError = (key: string) => setFieldErrors((current) => (key in current ? Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)) : current));
  const setValue = (key: string, value: string | boolean) => {
    clearFieldError(key);
    setForm((current) => (current ? { ...current, values: { ...current.values, [key]: value } } : current));
  };
  const setTranslation = (code: TranslationLang, key: string, value: string) =>
    setForm((current) => (current ? { ...current, translations: { ...current.translations, [code]: { ...current.translations[code], [key]: value } } } : current));

  /** Sends every English text of the record to the translation service and fills the Arabic / Turkish copies with the answer. */
  async function autoTranslate(langs: TranslationLang[], overwrite: boolean) {
    if (!form) return 0;
    const source: Record<string, string> = {};
    const existing: TranslationMap = { ar: {}, tr: {} };
    const note = (key: string, text: string, current: Record<TranslationLang, string>) => {
      if (!text.trim()) return;
      source[key] = text;
      for (const code of TRANSLATION_LANGS) existing[code][key] = current[code];
    };
    for (const field of def.fields) {
      if (!field.translatable) continue;
      const value = form.values[field.key];
      note(`f__${field.key}`, typeof value === "string" ? value : "", { ar: form.translations.ar[field.key] ?? "", tr: form.translations.tr[field.key] ?? "" });
    }
    form.media.forEach((item, index) => note(`m__${index}`, item.alt, { ar: item.translations.ar.alt, tr: item.translations.tr.alt }));
    form.services.forEach((item, index) => {
      for (const part of ["title", "summary", "deliverables"] as const) note(`s__${index}__${part}`, item[part], { ar: item.translations.ar[part], tr: item.translations.tr[part] });
    });

    const { result, count } = await translateTexts(source, existing, langs, overwrite);
    setForm((current) => {
      if (!current) return current;
      const next: FormState = {
        ...current,
        translations: { ar: { ...current.translations.ar }, tr: { ...current.translations.tr } },
        media: current.media.map((item) => ({ ...item, translations: { ar: { ...item.translations.ar }, tr: { ...item.translations.tr } } })),
        services: current.services.map((item) => ({ ...item, translations: { ar: { ...item.translations.ar }, tr: { ...item.translations.tr } } })),
      };
      for (const code of langs) {
        for (const [key, text] of Object.entries(result[code])) {
          const [kind, a, b] = key.split("__");
          if (kind === "f" && a) next.translations[code][a] = text;
          else if (kind === "m" && next.media[Number(a)]) next.media[Number(a)]!.translations[code].alt = text;
          else if (kind === "s" && next.services[Number(a)] && (b === "title" || b === "summary" || b === "deliverables")) next.services[Number(a)]!.translations[code][b] = text;
        }
      }
      return next;
    });
    return count;
  }

  function startNew() {
    const next = emptyForm(def);
    next.values.sort_order = String(rows?.length ?? 0);
    setForm(next);
    setBaseline(JSON.stringify(next));
    setSelection("new");
    setLang("en");
    setNotice("");
    setError("");
    setFieldErrors({});
    setServiceErrors({});
  }

  async function save() {
    if (!form) return;
    const problems: Record<string, string> = {};
    for (const field of def.fields) if (field.required && !String(form.values[field.key] ?? "").trim()) problems[field.key] = `${field.label} is required.`;
    const serviceProblems: Record<number, { title?: string; summary?: string }> = {};
    if (def.extra === "services") {
      form.services.forEach((item, index) => {
        const touched = [item.title, item.summary, item.deliverables].some((value) => value.trim());
        if (!touched) return;
        if (!item.title.trim()) serviceProblems[index] = { ...serviceProblems[index], title: "A service needs a title." };
        if (!item.summary.trim()) serviceProblems[index] = { ...serviceProblems[index], summary: "A service needs a summary." };
      });
    }
    if (Object.keys(problems).length || Object.keys(serviceProblems).length) {
      setLang("en");
      setFieldErrors(problems);
      setServiceErrors(serviceProblems);
      setError("");
      setNotice("");
      setFocusTick((tick) => tick + 1);
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    setFieldErrors({});
    setServiceErrors({});
    try {
      const creating = selection === "new" && !isSingle;
      const payload = formToPayload(def, form, creating ? "create" : "update");
      const saved = creating
        ? await resourceApi.create(def.endpoint, payload)
        : await resourceApi.update(isSingle ? def.endpoint : `${def.endpoint}/${selection}`, payload);
      const next = rowToForm(def, saved);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setSelection(String(saved.id ?? "single"));
      setRows((current) => {
        const list = current ?? [];
        const index = list.findIndex((row) => row.id === saved.id);
        if (index === -1) return isSingle ? [saved] : [...list, saved];
        return list.map((row, i) => (i === index ? saved : row));
      });
      setNotice(creating ? `The ${def.singular} was created.` : "Saved. The change is live on the public site after its next refresh.");
    } catch (failure) {
      if (failure instanceof ApiError && failure.details.length) {
        // The server names the property each message is about ("slug must be..."): put each message on its field.
        const mapped: Record<string, string> = {};
        const rest: string[] = [];
        for (const detail of failure.details) {
          const field = def.fields.find((item) => detail.startsWith(`${item.key} `));
          if (field) mapped[field.key] ??= `${field.label}${detail.slice(field.key.length)}`.replace(/([^.])$/, "$1.");
          else rest.push(detail);
        }
        setFieldErrors(mapped);
        setError(rest.length ? [failure.message, ...rest].join(" · ") : Object.keys(mapped).length ? "" : failure.readable);
        if (Object.keys(mapped).length) setFocusTick((tick) => tick + 1);
      } else {
        setError(failure instanceof ApiError ? failure.readable : "Saving failed.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!form || selection === null || selection === "new") return;
    setDeleting(true);
    try {
      await resourceApi.remove(`${def.endpoint}/${selection}`);
      setRows((current) => (current ?? []).filter((row) => row.id !== selection));
      setForm(null);
      setSelection(null);
      setConfirmDelete(false);
      setNotice(`The ${def.singular} was deleted.`);
    } catch (failure) {
      setConfirmDelete(false);
      setError(failure instanceof ApiError ? failure.readable : "Deleting failed.");
    } finally {
      setDeleting(false);
    }
  }

  const editorVisible = form !== null;
  const heading = form ? String(form.values[def.fields[0]?.key] ?? "").trim() : "";

  return (
    <div className="grid gap-5 lg:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{def.group}</Eyebrow>
          <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">{def.label}</h1>
          <p className="m-0 mt-2 max-w-[620px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">{def.emptyMessage}</p>
        </div>
        {!isSingle && (
          <FormButton icon={<Plus size={16} aria-hidden="true" />} onClick={startNew}>
            New {def.singular}
          </FormButton>
        )}
      </header>

      {loadError && <FormMessage tone="error">{loadError}</FormMessage>}
      {rows === null && !loadError && <Spinner label="Loading records" />}

      {rows !== null && (
        <div className={isSingle ? "grid" : "grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6"}>
          {!isSingle && (
            <Card className={`${editorVisible ? "hidden lg:block" : ""} h-fit lg:sticky lg:top-28`}>
              <Input aria-label={`Search ${def.label}`} leading={<Search size={16} aria-hidden="true" />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${def.label.toLowerCase()}`} />
              <p className="m-0 mt-4 mb-2 font-mono text-[12px] font-bold tracking-[0.08em] text-[#6b7f7d]">
                {rows.length} {rows.length === 1 ? "RECORD" : "RECORDS"}
              </p>
              <ul className="m-0 grid max-h-[62vh] list-none gap-1 overflow-y-auto p-0">
                {visibleRows.map((row) => {
                  const id = String(row.id ?? "");
                  const active = selection === id;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          open(row);
                          setLang("en");
                        }}
                        aria-current={active}
                        className={`group flex w-full items-center gap-3 rounded-[18px] border-0 px-3.5 py-3 text-start cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-teal ${active ? "bg-[#e5efed]" : "bg-transparent hover:bg-[#f4f8f7]"}`}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#eef5f3] text-teal">
                          <Icon size={16} aria-hidden="true" />
                        </span>
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <strong className="truncate font-sans text-[14.5px] font-bold text-[#0f2422]">{def.titleOf(row)}</strong>
                          <small className="truncate font-sans text-[12.5px] text-[#6b7f7d]">{def.metaOf(row) || "—"}</small>
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-[#8aa19d] rtl:rotate-180" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
                {visibleRows.length === 0 && (
                  <li className="grid justify-items-center gap-3 px-3 py-8 text-center">
                    <Sparkles size={20} className="text-teal" aria-hidden="true" />
                    <p className="m-0 font-sans text-[14px] leading-[1.6] text-[#526563]">{rows.length === 0 ? def.emptyMessage : "Nothing matches your search."}</p>
                    {rows.length === 0 && (
                      <FormButton variant="soft" onClick={startNew}>
                        New {def.singular}
                      </FormButton>
                    )}
                  </li>
                )}
              </ul>
            </Card>
          )}

          <div className={editorVisible ? "" : "hidden lg:block"}>
            {form ? (
              <Card className="grid gap-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    {!isSingle && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(null);
                          setSelection(null);
                        }}
                        className="mb-3 inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-sans text-[13px] font-bold text-teal cursor-pointer lg:hidden"
                      >
                        <ArrowLeft size={15} className="rtl:rotate-180" aria-hidden="true" /> All {def.label.toLowerCase()}
                      </button>
                    )}
                    <Eyebrow>{selection === "new" ? `New ${def.singular}` : `Editing ${def.singular}`}</Eyebrow>
                    <h2 className="m-0 mt-2 break-words font-sans text-[22px] font-bold leading-[1.25] tracking-[-0.02em] text-[#0f2422]">{heading || `Untitled ${def.singular}`}</h2>
                  </div>
                  {dirty && <span className="font-sans text-[12.5px] font-bold text-[#b0651d]">Unsaved changes</span>}
                </div>

                {translatable && (
                  <SegmentedControl
                    role="tabs"
                    label="Language"
                    value={lang}
                    onChange={setLang}
                    options={LANGS.map((item) => ({ value: item.code, label: item.label }))}
                    renderOption={(option) => (
                      <>
                        <span lang={option.value} dir={LANGS.find((item) => item.code === option.value)?.dir}>
                          {option.label}
                        </span>
                        {option.value !== "en" && hasLang(form, option.value as TranslationLang) && <span className="size-1.5 rounded-full bg-teal" aria-label="has content" />}
                      </>
                    )}
                  />
                )}

                {translatable && <AutoTranslateBar current={lang} onTranslate={autoTranslate} onError={(message) => { setNotice(""); setError(message); }} onDone={(message) => { setError(""); setNotice(message); }} />}

                {lang !== "en" && (
                  <p className="m-0 font-sans text-[13.5px] leading-[1.6] text-[#526563]">
                    You are editing the {LANGS.find((item) => item.code === lang)?.label} version. Any field left empty shows the English text on the public site.
                  </p>
                )}

                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  {def.fields.map((field) => (
                    <FieldRenderer key={field.key} field={field} form={form} lang={lang} idPrefix={`field-${def.key}`} onValue={setValue} onTranslation={setTranslation} onError={setError} error={lang === "en" ? fieldErrors[field.key] : undefined} />
                  ))}
                  {def.extra === "cv_files" && <CvFilesManager value={form.cvFiles} lang={lang} onChange={(cvFiles) => setForm({ ...form, cvFiles })} />}
                  {def.extra === "media" && <MediaManager items={form.media} lang={lang} onChange={(media) => setForm({ ...form, media })} />}
                  {def.extra === "services" && <ServicesEditor
                      items={form.services}
                      lang={lang}
                      errors={serviceErrors}
                      onChange={(services) => {
                        setServiceErrors({});
                        setForm({ ...form, services });
                      }}
                    />}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <FormButton busy={saving} icon={<Save size={16} aria-hidden="true" />} onClick={() => void save()}>
                    {saving ? "Saving…" : selection === "new" && !isSingle ? `Create ${def.singular}` : "Save changes"}
                  </FormButton>
                  {selection !== "new" && !isSingle && (
                    <FormButton variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
                      Delete
                    </FormButton>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="grid place-items-center gap-3 py-16 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-[#eef5f3] text-teal">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <Eyebrow>Ready when you are</Eyebrow>
                <h2 className="m-0 font-sans text-[22px] font-bold tracking-[-0.02em] text-[#0f2422]">Select a {def.singular} to edit</h2>
                <p className="m-0 max-w-[360px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">Choose a record from the list, or create a new one.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete “${heading || def.singular}”?`}
          body="This permanently removes it from the portfolio. Continue only if you no longer want it to appear."
          confirmLabel="Delete permanently"
          busy={deleting}
          onConfirm={() => void remove()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <StatusToast error={error} notice={notice} />
    </div>
  );
}
