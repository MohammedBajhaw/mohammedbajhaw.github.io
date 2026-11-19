"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n/client";

export type MediaGalleryItem = { id: string | number; src: string; alt: string; caption?: string | null };

/** The full-screen viewer is only needed after a click, so its code is fetched on demand and never rendered on the server. */
const loadLightbox = () => import("./MediaLightbox").then((module) => module.MediaLightbox);
const MediaLightbox = dynamic(loadLightbox, { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");
const GLASS_BUTTON =
  "group grid w-[44px] h-[44px] place-items-center rounded-full bg-white/15 backdrop-blur-md text-white border-0 cursor-pointer transition-colors duration-200 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2";

/**
 * Same stage as the home gallery (gradient frame, feathered caption overlay, glass controls), driven by the visitor
 * instead of a timer. The zoom button opens the full-screen viewer.
 */
export function MediaGallery({ items }: { items: MediaGalleryItem[] }) {
  const { t, dir } = useI18n();
  const rtl = dir === "rtl";
  const [index, setIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = items.length;

  const go = useCallback(
    (next: number) => {
      if (count > 0) setIndex(((next % count) + count) % count);
    },
    [count],
  );

  if (count === 0) return null;
  const active = items[index] ?? items[0];

  return (
    <>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={t("media.galleryLabel")}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") go(index + (rtl ? 1 : -1));
          if (event.key === "ArrowRight") go(index + (rtl ? -1 : 1));
        }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > 40) go(index + ((delta < 0) !== rtl ? 1 : -1));
          touchStart.current = null;
        }}
      >
        {/* Slim white-to-teal gradient frame, as on the home gallery */}
        <div className="rounded-[34px] sm:rounded-[45px] p-[2px] bg-linear-45 from-white via-[#cde5df] to-[#176b69] shadow-[0_24px_60px_rgba(12,45,44,0.14)]">
          <div className="relative aspect-4/3 md:aspect-[16/8.6] rounded-[32px] sm:rounded-[43px] overflow-hidden bg-[#0b1f1d]">
            {items.map((item, i) => {
              const near = Math.abs(i - index) <= 1 || (index === 0 && i === count - 1) || (index === count - 1 && i === 0);
              const isActive = i === index;
              return (
                <figure
                  key={item.id}
                  className={`absolute inset-0 m-0 transition-opacity duration-700 motion-reduce:transition-none ${
                    isActive ? "z-10 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                  aria-hidden={!isActive}
                  role="group"
                  aria-label={t("media.slideOf", { current: i + 1, total: count })}
                >
                  {near && (
                    <Image
                      className="object-cover object-center"
                      fill
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                    />
                  )}
                </figure>
              );
            })}

            {/* Counter, plain text like the home gallery's label */}
            <span
              className="absolute top-5 start-6 sm:top-7 sm:start-9 z-30 font-mono text-[12px] sm:text-[13px] font-bold tracking-[0.08em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
              dir="ltr"
            >
              {pad(index + 1)} / {pad(count)}
            </span>

            {/* Inner edge shadow */}
            <div
              className="absolute inset-0 z-25 rounded-[32px] sm:rounded-[43px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),inset_0_0_22px_rgba(8,27,26,0.48)] pointer-events-none"
              aria-hidden="true"
            />

            {/* Feathered caption overlay with the controls */}
            <div
              className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-[#081b1a]/88 via-[#081b1a]/28 via-42% to-transparent px-6 pt-32 pb-6 sm:px-9 sm:pt-44 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
              aria-live="polite"
            >
              <strong className="block max-w-[660px] font-sans font-bold text-[17px] sm:text-[22px] leading-[1.28] tracking-[-0.02em] text-white rtl:text-[20.5px] rtl:sm:text-[25px]">
                {active.caption ?? active.alt}
              </strong>

              <div className="flex items-center gap-2.5 shrink-0">
                {count > 1 && (
                  <>
                    <button type="button" className={GLASS_BUTTON} onClick={() => go(index - 1)} aria-label={t("media.previous")}>
                      <ChevronLeft size={18} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                    </button>
                    <button type="button" className={GLASS_BUTTON} onClick={() => go(index + 1)} aria-label={t("media.next")}>
                      <ChevronRight size={18} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className={GLASS_BUTTON}
                  onClick={() => setViewerOpen(true)}
                  onPointerEnter={loadLightbox}
                  onFocus={loadLightbox}
                  aria-label={t("media.enlarge", { alt: active.alt })}
                >
                  <ZoomIn size={18} className="transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {viewerOpen && <MediaLightbox items={items} initialIndex={index} onClose={() => setViewerOpen(false)} />}
    </>
  );
}

export function MediaGallerySkeleton() {
  return (
    <div aria-hidden="true">
      <div className="rounded-[34px] sm:rounded-[45px] p-[2px] bg-linear-45 from-white via-[#cde5df] to-[#176b69] shadow-[0_24px_60px_rgba(12,45,44,0.14)]">
        <div className="relative aspect-4/3 md:aspect-[16/8.6] rounded-[32px] sm:rounded-[43px] bg-[#0b1f1d] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
          <Skeleton tone="dark" className="h-3.5 w-16 rounded-full" />
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <Skeleton tone="dark" className="h-6 w-64 sm:w-80 rounded-[8px]" />
            <div className="flex items-center gap-2.5 shrink-0">
              <Skeleton tone="dark" className="w-[44px] h-[44px] rounded-full" />
              <Skeleton tone="dark" className="w-[44px] h-[44px] rounded-full" />
              <Skeleton tone="dark" className="w-[44px] h-[44px] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
