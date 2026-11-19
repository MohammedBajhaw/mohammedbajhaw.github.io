"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { ACCEPT, FileUpload, Input, isImagePath } from "@/components/forms";
import { uploadApi } from "@/lib/admin/api";
import { LANGS, emptyMedia, type Lang, type MediaForm, type TranslationLang } from "@/lib/admin/resources";
import { IconButton } from "./ui";

/** The images of a project: drop them in, describe them, order them. In AR / TR it edits each image's translated description. */
export function MediaManager({ items, lang, onChange }: { items: MediaForm[]; lang: Lang; onChange: (items: MediaForm[]) => void }) {
  const translating = lang !== "en";
  const dir = LANGS.find((item) => item.code === lang)?.dir ?? "ltr";

  // Several files can finish in the same moment; appending to the latest list keeps every one of them.
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  });
  const append = (path: string) => {
    const next = [...latest.current, { ...emptyMedia(), storage_path: path, sort_order: String(latest.current.length) }];
    latest.current = next;
    onChange(next);
  };

  const patch = (index: number, change: Partial<MediaForm>) => onChange(items.map((item, i) => (i === index ? { ...item, ...change } : item)));
  const setTranslatedAlt = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, translations: { ...item.translations, [lang as TranslationLang]: { alt: value } } } : item)));
  const move = (index: number, step: number) => {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, i) => ({ ...item, sort_order: String(i) })));
  };

  return (
    <div className="sm:col-span-2 grid gap-3">
      <div>
        <p className="m-0 font-sans text-[13px] font-bold text-[#41605b]">Images</p>
        <p className="m-0 mt-1 font-sans text-[12.5px] text-[#6b7f7d]">
          {translating ? "Describe each image in this language." : "The first image leads the project page. Use the arrows to reorder."}
        </p>
      </div>

      {!translating && (
        <FileUpload multiple upload={uploadApi.upload} accept={ACCEPT.image} maxSizeMB={50} hint="JPG, PNG, WebP or GIF, up to 50 MB each" onUploaded={(file) => append(file.url)} />
      )}

      {items.length === 0 && <p className="m-0 rounded-[18px] bg-[#f4f8f7] px-4 py-6 text-center font-sans text-[14px] text-[#6b7f7d]">No images yet.</p>}

      {items.map((item, index) => (
        <div key={`${item.storage_path}-${index}`} className="grid gap-3 rounded-[22px] bg-[#f4f8f7] p-3 sm:grid-cols-[132px_1fr] sm:p-4">
          <div className="relative h-[100px] overflow-hidden rounded-[16px] bg-white sm:h-[92px]">
            {isImagePath(item.storage_path) ? (
              <Image src={item.storage_path} alt="" fill unoptimized sizes="132px" className="object-cover" />
            ) : (
              <span className="grid h-full place-items-center px-2 text-center font-sans text-[12px] text-[#6b7f7d]">No preview</span>
            )}
          </div>
          <div className="grid min-w-0 gap-3">
            {translating ? (
              <Input
                tone="white"
                label={`Description (${LANGS.find((entry) => entry.code === lang)?.label})`}
                dir={dir}
                value={item.translations[lang as TranslationLang].alt}
                onChange={(event) => setTranslatedAlt(index, event.target.value)}
                placeholder={item.alt ? `English: ${item.alt}` : "Image description"}
              />
            ) : (
              <>
                <Input tone="white" label="Description" value={item.alt} onChange={(event) => patch(index, { alt: event.target.value })} placeholder="What the image shows" />
                <p className="m-0 break-all font-sans text-[12px] text-[#6b7f7d]">{item.storage_path}</p>
                <div className="flex items-center gap-1">
                  <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={17} /></IconButton>
                  <IconButton label="Move down" disabled={index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={17} /></IconButton>
                  <IconButton label="Remove image" className="ms-auto hover:bg-[#fbeeee]! hover:text-[#a32a2a]!" onClick={() => onChange(items.filter((_, i) => i !== index))}>
                    <Trash2 size={17} />
                  </IconButton>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
