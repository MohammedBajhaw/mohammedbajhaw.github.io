"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import type { MediaGalleryItem } from "./MediaGallery";

type ZoomSize = { width: number; height: number };

/**
 * Full-screen viewer with zoom. It is loaded on demand (see MediaGallery) because most visitors never open it,
 * and it mounts open: closing it unmounts it.
 */
export function MediaLightbox({ items, initialIndex, onClose }: { items: MediaGalleryItem[]; initialIndex: number; onClose: () => void }) {
  const { t, dir } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomFocus = useRef({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(initialIndex);
  const [zoom, setZoom] = useState<ZoomSize | null>(null);
  const item = items[active];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!zoom || !stage) return;
    stage.scrollLeft = zoomFocus.current.x * stage.scrollWidth - stage.clientWidth / 2;
    stage.scrollTop = zoomFocus.current.y * stage.scrollHeight - stage.clientHeight / 2;
  }, [zoom]);

  function go(step: number) {
    setActive((current) => (current + step + items.length) % items.length);
    setZoom(null);
  }

  function fitted() {
    const image = imageRef.current;
    const stage = stageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight || !stage) return null;
    const { naturalWidth, naturalHeight } = image;
    const { clientWidth, clientHeight } = stage;
    const scale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
    return { naturalWidth, naturalHeight, clientWidth, clientHeight, scale };
  }

  function zoomIn(focusX = 0.5, focusY = 0.5) {
    const fit = fitted();
    if (!fit) return;
    const fill = Math.max(fit.clientWidth / fit.naturalWidth, fit.clientHeight / fit.naturalHeight);
    const scale = Math.max(fit.scale * 2, Math.min(fill, fit.scale * 4));
    zoomFocus.current = { x: focusX, y: focusY };
    setZoom({ width: Math.round(fit.naturalWidth * scale), height: Math.round(fit.naturalHeight * scale) });
  }

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    event.stopPropagation();
    if (zoom) return setZoom(null);
    const fit = fitted();
    if (!fit) return;
    const box = event.currentTarget.getBoundingClientRect();
    const width = fit.naturalWidth * fit.scale;
    const height = fit.naturalHeight * fit.scale;
    const x = (event.clientX - box.left - (box.width - width) / 2) / width;
    const y = (event.clientY - box.top - (box.height - height) / 2) / height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return dialogRef.current?.close();
    zoomIn(x, y);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (zoom || items.length < 2) return;
    const flip = dir === "rtl" ? -1 : 1;
    if (event.key === "ArrowLeft") go(-flip);
    if (event.key === "ArrowRight") go(flip);
  }

  const glass =
    "group grid w-[44px] h-[44px] place-items-center rounded-full bg-white/15 backdrop-blur-md text-white border-0 cursor-pointer transition-colors duration-200 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2";
  const many = items.length > 1;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 w-screen max-w-none h-dvh max-h-none m-0 p-0 overflow-hidden border-0 bg-[#0b1f1d] text-white open:grid open:grid-rows-[auto_minmax(0,1fr)_auto]"
      aria-label={t("media.dialog")}
      onClose={onClose}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
        <span className="min-w-[56px] font-mono font-bold text-[13px] tracking-[0.08em] text-[#cdd9d7]" dir="ltr">
          {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2.5">
          <button type="button" className={glass} onClick={() => (zoom ? setZoom(null) : zoomIn())} aria-label={zoom ? t("media.fit") : t("media.zoomIn")}>
            {zoom ? <ZoomOut size={18} aria-hidden="true" /> : <ZoomIn size={18} aria-hidden="true" />}
          </button>
          <button type="button" className={glass} onClick={() => dialogRef.current?.close()} aria-label={t("media.close")}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative min-w-0 min-h-0">
        <div
          ref={stageRef}
          className={`flex h-full min-w-0 min-h-0 ${zoom ? "overflow-auto" : "overflow-hidden"}`}
          onClick={() => dialogRef.current?.close()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- the zoom maths needs the original file's natural size */}
          <img
            key={item.id}
            ref={imageRef}
            src={item.src}
            alt={item.alt}
            style={zoom ?? undefined}
            onClick={handleImageClick}
            className={`block shrink-0 w-full h-full m-auto object-contain ${zoom ? "max-w-none cursor-zoom-out" : "cursor-zoom-in"}`}
          />
        </div>

        {many && !zoom && (
          <>
            <button type="button" className={`${glass} !bg-[#0b1f1d]/70 hover:!bg-[#0b1f1d]/90 absolute top-1/2 -translate-y-1/2 start-3 sm:start-6 z-10`} onClick={() => go(-1)} aria-label={t("media.previous")}>
              <ChevronLeft size={20} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
            </button>
            <button type="button" className={`${glass} !bg-[#0b1f1d]/70 hover:!bg-[#0b1f1d]/90 absolute top-1/2 -translate-y-1/2 end-3 sm:end-6 z-10`} onClick={() => go(1)} aria-label={t("media.next")}>
              <ChevronRight size={20} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <p className="m-0 min-h-[52px] px-5 py-3.5 text-center font-sans text-[14px] leading-[1.5] text-[#d4dedc] rtl:text-[17px]">{item.caption ?? ""}</p>
    </dialog>
  );
}
