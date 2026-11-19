"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownToLine } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import type { ProfileCvFile } from "@/lib/types";

export function CvMenu({ className = "", cvFiles = [] }: { className?: string; cvFiles?: ProfileCvFile[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === "keydown" && (event as KeyboardEvent).key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.type === "mousedown" && ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [open]);

  if (cvFiles.length === 0) return null;

  return (
    <div ref={ref} className={`relative ${className}`.trim()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="group inline-flex w-full sm:w-auto items-center justify-center h-[46px] px-3 sm:px-6 rounded-full bg-white text-[#102927] font-sans text-[12.5px] rtl:text-[15.5px] font-bold border-0 cursor-pointer transition-colors duration-200 hover:bg-[#e5efed]"
      >
        <span className="inline-flex items-center gap-2 transition-transform duration-180 ease-out-expo group-hover:scale-105">
          <span>{t("cv.download")}</span>
          <ArrowDownToLine size={14} className="text-teal" aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-30 min-w-[164px] rounded-2xl bg-white p-1.5 shadow-[0_14px_34px_rgba(16,41,39,0.14)] border border-black/5"
        >
          {cvFiles.map((cv) => {
            const ext = cv.file.split("?")[0]?.split(".").pop()?.toUpperCase();
            const fileBadge = ext && ext.length <= 5 ? ext : t("cv.pdf");
            return (
              <a
                key={`${cv.label}-${cv.file}`}
                href={cv.file}
                download
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-4 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-[#102927] hover:bg-[#eef6f4] transition-colors whitespace-nowrap rtl:text-[14.5px]"
              >
                <span>{cv.label}</span>
                <span className="font-sans text-[10px] font-bold text-teal rtl:text-[12px]">{fileBadge} ↓</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
