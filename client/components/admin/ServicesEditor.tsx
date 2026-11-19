"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormButton, Input, Textarea } from "@/components/forms";
import { LANGS, emptyService, type Lang, type ServiceForm, type TranslationLang } from "@/lib/admin/resources";
import { IconButton } from "./ui";

/** The services inside one area. In AR / TR it edits each service's translated title, summary and deliverables. */
export function ServicesEditor({ items, lang, onChange, errors = {} }: { items: ServiceForm[]; lang: Lang; onChange: (items: ServiceForm[]) => void; errors?: Record<number, { title?: string; summary?: string }> }) {
  const translating = lang !== "en";
  const dir = LANGS.find((item) => item.code === lang)?.dir ?? "ltr";
  const code = lang as TranslationLang;

  const patch = (index: number, change: Partial<ServiceForm>) => onChange(items.map((item, i) => (i === index ? { ...item, ...change } : item)));
  const patchTranslation = (index: number, change: Partial<ServiceForm["translations"][TranslationLang]>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, translations: { ...item.translations, [code]: { ...item.translations[code], ...change } } } : item)));

  return (
    <div className="sm:col-span-2 grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 font-sans text-[13px] font-bold text-[#41605b]">Services in this area</p>
          <p className="m-0 mt-1 font-sans text-[12.5px] text-[#6b7f7d]">{translating ? "Translate each service." : "Each service has a title, a summary and a list of deliverables."}</p>
        </div>
        {!translating && (
          <FormButton variant="soft" icon={<Plus size={16} aria-hidden="true" />} onClick={() => onChange([...items, { ...emptyService(), sort_order: String(items.length) }])}>
            Add service
          </FormButton>
        )}
      </div>

      {items.length === 0 && <p className="m-0 rounded-[18px] bg-[#f4f8f7] px-4 py-6 text-center font-sans text-[14px] text-[#6b7f7d]">No services in this area yet.</p>}

      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-[22px] bg-[#f4f8f7] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <strong className="font-mono text-[12px] font-bold tracking-[0.08em] text-teal" dir="ltr">
              {String(index + 1).padStart(2, "0")}
            </strong>
            {!translating && (
              <IconButton label="Remove service" className="hover:bg-[#fbeeee]! hover:text-[#a32a2a]!" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                <Trash2 size={17} />
              </IconButton>
            )}
          </div>

          {translating ? (
            <>
              <Input tone="white" label="Title" dir={dir} value={item.translations[code].title} onChange={(event) => patchTranslation(index, { title: event.target.value })} placeholder={item.title ? `English: ${item.title}` : ""} />
              <Textarea tone="white" label="Summary" dir={dir} rows={3} value={item.translations[code].summary} onChange={(event) => patchTranslation(index, { summary: event.target.value })} placeholder={item.summary ? `English: ${item.summary.slice(0, 110)}` : ""} />
              <Textarea
                tone="white"
                label="Deliverables"
                help="One per line."
                dir={dir}
                rows={3}
                value={item.translations[code].deliverables}
                onChange={(event) => patchTranslation(index, { deliverables: event.target.value })}
                placeholder={item.deliverables ? `English: ${item.deliverables.split("\n").join(" · ").slice(0, 110)}` : ""}
              />
            </>
          ) : (
            <>
              <Input tone="white" label="Title *" error={errors[index]?.title} value={item.title} onChange={(event) => patch(index, { title: event.target.value })} placeholder="ROS / ROS 2 robot simulation" />
              <Textarea tone="white" label="Summary *" error={errors[index]?.summary} rows={3} value={item.summary} onChange={(event) => patch(index, { summary: event.target.value })} placeholder="What the client receives" />
              <Textarea tone="white" label="Deliverables" help="One per line, so commas inside a sentence are safe." rows={3} value={item.deliverables} onChange={(event) => patch(index, { deliverables: event.target.value })} placeholder={"Source code\nSetup instructions"} />
              <Input tone="white" label="Display order" type="number" min={0} value={item.sort_order} onChange={(event) => patch(index, { sort_order: event.target.value })} wrapperClassName="max-w-[180px]" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
