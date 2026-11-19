"use client";

import { LANGS, type FieldDefinition, type FormState, type Lang, type TranslationLang } from "@/lib/admin/resources";
import { uploadApi } from "@/lib/admin/api";
import { DatePicker, FormField, Input, MediaField, TagInput, Textarea, Toggle } from "@/components/forms";
import { RichTextEditor } from "./RichTextEditor";

type FieldRendererProps = {
  field: FieldDefinition;
  form: FormState;
  lang: Lang;
  idPrefix: string;
  onValue: (key: string, value: string | boolean) => void;
  onTranslation: (lang: TranslationLang, key: string, value: string) => void;
  onError: (message: string) => void;
  /** A validation message for this field (English tab only). */
  error?: string;
};

const splitCommas = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);

/** One form control, chosen by the field's kind. In English it edits the record itself; in AR / TR it edits that language's copy. */
export function FieldRenderer({ field, form, lang, idPrefix, onValue, onTranslation, onError, error }: FieldRendererProps) {
  const kind = field.kind ?? "text";
  const id = `${idPrefix}-${field.key}`;
  const translating = lang !== "en";
  if (translating && !field.translatable) return null;

  const dir = LANGS.find((item) => item.code === lang)?.dir ?? "ltr";
  const base = form.values[field.key];
  const value = translating ? (form.translations[lang as TranslationLang][field.key] ?? "") : base;
  const text = typeof value === "string" ? value : "";
  const setText = (next: string) => (translating ? onTranslation(lang as TranslationLang, field.key, next) : onValue(field.key, next));
  const hint = translating && typeof base === "string" && base ? `English: ${base.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 110)}` : field.placeholder;
  const label = field.required && !translating ? `${field.label} *` : field.label;
  const wide = !field.half || kind === "textarea" || kind === "richtext" || kind === "lines" || kind === "array" || kind === "file";

  if (kind === "toggle") {
    return (
      <div className="sm:col-span-2">
        <Toggle id={id} checked={Boolean(value)} onChange={(next) => onValue(field.key, next)} label={field.label} help={field.help} />
      </div>
    );
  }

  if (kind === "richtext") {
    return (
      <FormField id={id} label={label} help={field.help} error={error} wide>
        <RichTextEditor id={id} value={text} dir={dir} placeholder={hint} invalid={Boolean(error)} onChange={setText} onError={onError} />
      </FormField>
    );
  }

  if (kind === "file") {
    return <MediaField id={id} label={label} help={field.help} error={error} wide value={text} kind={field.accept ?? "image"} upload={uploadApi.upload} onChange={setText} maxSizeMB={50} />;
  }

  if (kind === "date") {
    return <DatePicker id={id} label={label} help={field.help} error={error} wide={wide} dir={dir} value={text} allowPresent={field.allowPresent} onChange={setText} placeholder={hint} />;
  }

  if (kind === "array") {
    return <TagInput id={id} label={label} help={field.help} error={error} wide dir={dir} value={splitCommas(text)} onChange={(tags) => setText(tags.join(", "))} placeholder={hint} />;
  }

  if (kind === "textarea" || kind === "lines") {
    return <Textarea id={id} label={label} help={field.help} error={error} wide dir={dir} rows={kind === "lines" ? 5 : 4} value={text} onChange={(event) => setText(event.target.value)} placeholder={hint} />;
  }

  return (
    <Input
      id={id}
      label={label}
      help={field.help}
      error={error}
      wide={wide}
      dir={dir}
      type={kind === "number" ? "number" : "text"}
      min={kind === "number" ? 0 : undefined}
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={hint}
    />
  );
}
