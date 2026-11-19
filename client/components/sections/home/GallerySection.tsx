 "use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import type { GallerySlide } from "@/lib/gallery";
import { usePrefersReducedMotion } from "@/lib/hooks/useBrowserState";
import { useI18n } from "@/lib/i18n/client";

const INTERVAL_MS = 5200;

export function HomeGallery({ slides }: { slides: GallerySlide[] }) {
  const { t, href, dir } = useI18n();
  const rtl = dir === "rtl";
  const [rawIndex, setIndex] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  const [hovering, setHovering] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;
  const index = rawIndex >= count ? 0 : rawIndex;

  const go = useCallback(
    (next: number) => {
      if (count > 0) setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2 || hovering || reduceMotion) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [count, go, hovering, index, reduceMotion]);

  if (count === 0) return null;
  const active = slides[index];

  return (
    <section
      className="relative w-full pt-6 pb-16 sm:pt-10 sm:pb-24"
      aria-roledescription="carousel"
      aria-label={t("gallery.ariaLabel")}
    >
      <div className="shell relative z-10">
        {/* Header row */}
        <Reveal className="mb-7 sm:mb-9">
          <p className="mono-eyebrow mb-2">{t("gallery.eyebrow")}</p>
          <h2 className="m-0 font-extrabold text-[clamp(30px,4vw,48px)] leading-[1.06] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
            {t("gallery.title")}
          </h2>
        </Reveal>

        {/* Interactive gallery stage */}
        <Reveal delay={70}>
        <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocus={() => setHovering(true)}
          onBlur={() => setHovering(false)}
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
          {/* Slim solid white-to-brand-teal gradient border frame with reinforced inner shadow */}
          <div className="rounded-[34px] sm:rounded-[45px] p-[2px] bg-linear-45 from-white via-[#cde5df] to-[#176b69] shadow-[0_24px_60px_rgba(12,45,44,0.14)]">
            <div className="relative aspect-4/3 md:aspect-[16/8.6] rounded-[32px] sm:rounded-[43px] overflow-hidden bg-[#0b1f1d]">
            {slides.map((slide, i) => {
              const near =
                Math.abs(i - index) <= 1 || (index === 0 && i === count - 1) || (index === count - 1 && i === 0);
              const isActive = i === index;
              return (
                <figure
                  className={`absolute inset-0 m-0 transition-opacity duration-700 motion-reduce:transition-none ${
                    isActive ? "z-10 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                  key={`${slide.groupKey}-${slide.src}-${i}`}
                  aria-hidden={!isActive}
                  role="group"
                  aria-label={t("gallery.slideOf", { current: i + 1, total: count })}
                >
                  {near && (
                    <Image
                      className="object-cover object-center"
                      fill
                      sizes="(min-width: 1280px) 1200px, 100vw"
                      src={slide.src}
                      alt={slide.altKey ? t(`gallery.${slide.altKey}`) : slide.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  )}
                </figure>
              );
            })}

            {/* Top-left project program/nature label (plain text, no background or icon) */}
            <span className="absolute top-5 start-6 sm:top-7 sm:start-9 z-30 font-sans text-[12px] sm:text-[13px] font-bold tracking-[0.06em] uppercase text-white whitespace-nowrap drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] rtl:text-[14.5px] rtl:sm:text-[16px]">
              {active.badgeKey ? t(`gallery.badge${active.badgeKey}`) : active.badge}
            </span>

            {/* Reinforced inner shadow along the inside edge of the solid gradient border */}
            <div
              className="absolute inset-0 z-25 rounded-[32px] sm:rounded-[43px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),inset_0_0_22px_rgba(8,27,26,0.48)] pointer-events-none"
              aria-hidden="true"
            />

            {/* Bottom overlay gradient with tall feathered fade upward so there is no hard edge */}
            <div
              className="absolute inset-x-0 bottom-0 z-20 bg-linear-to-t from-[#081b1a]/88 via-[#081b1a]/28 via-42% to-transparent px-6 pt-32 pb-6 sm:px-9 sm:pt-44 sm:pb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4"
              aria-live="polite"
            >
              <div className="max-w-[660px]">
                <span className="block mb-1 font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-[#86dcd2] rtl:text-[13.5px]">
                  {t(`gallery.kind${active.kind}`)}
                </span>
                <strong className="block font-sans font-bold text-[17px] sm:text-[22px] leading-[1.28] tracking-[-0.02em] text-white rtl:text-[20.5px]">
                  {active.titleKey ? t(`gallery.${active.titleKey}`) : active.title}
                </strong>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  className="group grid w-[44px] h-[44px] place-items-center rounded-full bg-white/15 backdrop-blur-md text-white border-0 cursor-pointer transition-colors duration-200 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2"
                  onClick={() => go(index - 1)}
                  aria-label={t("gallery.previous")}
                >
                  <ChevronLeft size={18} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="group grid w-[44px] h-[44px] place-items-center rounded-full bg-white/15 backdrop-blur-md text-white border-0 cursor-pointer transition-colors duration-200 hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2"
                  onClick={() => go(index + 1)}
                  aria-label={t("gallery.next")}
                >
                  <ChevronRight size={18} className="rtl:rotate-180 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                </button>

                <Button variant="glass" href={href(active.href)} className="shrink-0 h-[44px] px-6 text-[12.5px] rtl:text-[15.5px]">
                  <span>{active.kind === "Research" ? t("gallery.readPaper") : t("gallery.viewProject")}</span>
                  <ArrowUpRight size={15} className="rtl:-rotate-90 text-[#e7e9e9]" aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Smooth progress line */}
            {!reduceMotion && count > 1 && !hovering && (
              <span
                className="absolute bottom-0 start-0 z-30 w-full h-[3px] bg-linear-to-r rtl:bg-linear-to-l from-[#268c89] to-[#86dcd2] origin-left rtl:origin-right animate-gallery-progress"
                key={`${index}-progress`}
                style={{ animationDuration: `${INTERVAL_MS}ms` }}
                aria-hidden="true"
              />
            )}
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

export function GallerySectionSkeleton() {
  return (
    <section className="relative w-full pt-6 pb-16 sm:pt-10 sm:pb-24" aria-hidden="true">
      <div className="shell relative z-10">
        <div className="mb-7 sm:mb-9 grid gap-2.5">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-10 w-72 rounded-[12px]" />
        </div>

        <div className="rounded-[34px] sm:rounded-[45px] p-[2px] bg-linear-45 from-white via-[#cde5df] to-[#176b69] shadow-[0_24px_60px_rgba(12,45,44,0.14)]">
          <div className="relative aspect-4/3 md:aspect-[16/8.6] rounded-[32px] sm:rounded-[43px] bg-[#0b1f1d] overflow-hidden p-6 sm:p-9 flex flex-col justify-between">
            <Skeleton tone="dark" className="h-3.5 w-36 rounded-full" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="grid gap-2.5">
                <Skeleton tone="dark" className="h-3 w-16 rounded-full" />
                <Skeleton tone="dark" className="h-6 w-64 sm:w-80 rounded-[8px]" />
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Skeleton tone="dark" className="w-[44px] h-[44px] rounded-full" />
                <Skeleton tone="dark" className="w-[44px] h-[44px] rounded-full" />
                <Skeleton tone="dark" className="h-[44px] w-36 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
