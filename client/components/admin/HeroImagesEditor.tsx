"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { ACCEPT, FileUpload, Input } from "@/components/forms";
import { uploadApi } from "@/lib/admin/api";
import { IconButton } from "./ui";

export const HERO_MAX_IMAGES = 20;

type Props = {
  images: string[];
  interval: string;
  intervalError?: string;
  onImages: (images: string[]) => void;
  onInterval: (value: string) => void;
  onError: (message: string) => void;
};

/** `/uploads/images/abc.jpg` -> where to delete it from, for pictures that did not fit in the list. */
const fileOf = (url: string) => {
  const match = /^\/uploads\/([a-z]+)\/([A-Za-z0-9._-]+)$/.exec(url);
  return match ? { category: match[1]!, filename: match[2]! } : null;
};

/** The pictures of the home page hero: up to 20, in display order. One stays still; several change by themselves. */
export function HeroImagesEditor({ images, interval, intervalError, onImages, onInterval, onError }: Props) {
  // Several files can finish in the same moment; appending to the latest list keeps every one of them.
  const latest = useRef(images);
  useEffect(() => {
    latest.current = images;
  });

  function append(url: string) {
    if (latest.current.length >= HERO_MAX_IMAGES) {
      // The list is full: do not keep a file nothing points to.
      const file = fileOf(url);
      if (file) void uploadApi.remove(file.category, file.filename).catch(() => undefined);
      onError(`The hero holds up to ${HERO_MAX_IMAGES} pictures. Remove one to add another.`);
      return;
    }
    const next = [...latest.current, url];
    latest.current = next;
    onImages(next);
  }

  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onImages(next);
  }

  const full = images.length >= HERO_MAX_IMAGES;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="m-0 font-sans text-[14px] leading-[1.65] text-[#526563]">
          Wide pictures work best (at least 1920 px). One picture stays still; two or more change by themselves, in the order below.
        </p>
        <strong className={`font-mono text-[13px] font-bold tracking-[0.06em] ${full ? "text-[#b0651d]" : "text-[#6b7f7d]"}`} dir="ltr">
          {images.length} / {HERO_MAX_IMAGES}
        </strong>
      </div>

      <FileUpload multiple disabled={full} upload={uploadApi.upload} accept={ACCEPT.image} maxSizeMB={50} hint={full ? "The hero is full" : "JPG, PNG or WebP, up to 50 MB each"} onUploaded={(file) => append(file.url)} onError={onError} />

      {images.length === 0 ? (
        <p className="m-0 rounded-[18px] bg-[#f4f8f7] px-4 py-6 text-center font-sans text-[14px] text-[#6b7f7d]">No hero pictures yet. The hero shows its dark background until you add some.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((url, index) => (
            <li key={url} className="grid gap-2 rounded-[22px] bg-[#f4f8f7] p-2.5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-white">
                <Image src={url} alt="" fill unoptimized sizes="240px" className="object-cover" />
                <span className="absolute start-2 top-2 rounded-full bg-[#0b2220]/75 px-2 py-0.5 font-mono text-[11px] font-bold text-white" dir="ltr">
                  {index + 1}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <IconButton label="Move earlier" className="size-8!" disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowLeft size={16} className="rtl:rotate-180" />
                  </IconButton>
                  <IconButton label="Move later" className="size-8!" disabled={index === images.length - 1} onClick={() => move(index, 1)}>
                    <ArrowRight size={16} className="rtl:rotate-180" />
                  </IconButton>
                </span>
                <IconButton label="Remove picture" className="size-8! hover:bg-[#fbeeee]! hover:text-[#a32a2a]!" onClick={() => onImages(images.filter((_, i) => i !== index))}>
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length > 1 && (
        <Input id="hero-interval" label="Change every (seconds)" help="Between 3 and 60 seconds." type="number" min={3} max={60} error={intervalError} value={interval} onChange={(event) => onInterval(event.target.value)} wrapperClassName="max-w-[220px]" />
      )}
    </div>
  );
}
