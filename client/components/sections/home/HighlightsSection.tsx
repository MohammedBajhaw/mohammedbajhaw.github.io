"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Trophy } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { usePrefersReducedMotion } from "@/lib/hooks/useBrowserState";
import { useI18n } from "@/lib/i18n/client";
import type { Achievement, Profile } from "@/lib/types";

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(target);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!start || reduced) return;
    const duration = 900;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target, reduced]);
  // Until the count-up starts (or when motion is reduced) the final number is shown as is.
  return !start || reduced ? target : value;
}

function MetricCard({
  label,
  target,
  start,
}: {
  label: string;
  target: number;
  start: boolean;
}) {
  const value = useCountUp(target, start);
  return (
    <div className="flex items-center justify-center py-2">
      <div className="inline-flex flex-col items-center gap-1.5 sm:flex-row sm:items-baseline sm:gap-2.5">
        <strong data-display className="font-sans font-extrabold text-[clamp(34px,3.6vw,46px)] leading-none tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
          {value}
        </strong>
        <span className="font-sans font-bold text-[11px] sm:text-[12px] tracking-[0.06em] uppercase text-[#4b635f] text-center rtl:text-[13.5px] rtl:sm:text-[14.5px]">
          {label}
        </span>
      </div>
    </div>
  );
}

export type HomeHighlightsSectionProps = {
  profile: Profile | null;
  featuredAchievement?: Achievement | null;
  counts?: {
    projects: number;
    publications: number;
    skills: number;
  };
};

export function HomeHighlightsSection({
  profile,
  featuredAchievement = null,
  counts = { projects: 0, publications: 0, skills: 0 },
}: HomeHighlightsSectionProps) {
  const { t, href } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={ref}
      className="relative z-10 w-full pt-12 pb-14 sm:pt-14 sm:pb-16 scroll-mt-4"
    >
      <div className="shell relative z-10">
          {/* Intro bio spanning the full container width */}
          <Reveal className="w-full mb-6 sm:mb-8">
            <p className="mono-eyebrow mb-2.5">{t("highlights.eyebrow")}</p>
            <p className="m-0 text-[#2b3f3d] text-[clamp(16px,1.45vw,20px)] leading-[1.7] font-medium">
              {profile?.bio ?? t("highlights.bioFallback")}
            </p>
          </Reveal>

          {/* Modern compact Bento row: 3 inline stat cards + 1 compact award card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            {/* Left: 3 inline Metrics (number + label on the same line) */}
            <Reveal delay={70} className={`${featuredAchievement ? "lg:col-span-6" : "lg:col-span-12"} grid grid-cols-3 gap-2 sm:gap-3`}>
              <MetricCard label={t("highlights.projects")} target={counts.projects} start={visible} />
              <MetricCard label={t("highlights.publications")} target={counts.publications} start={visible} />
              <MetricCard label={t("highlights.skills")} target={counts.skills} start={visible} />
            </Reveal>

            {/* Right: Compact Award Card from Profile Achievements */}
            {featuredAchievement ? (
              <Reveal delay={130} className="lg:col-span-6 flex">
                <Link
                  href={href(`/achievements/${featuredAchievement.slug}`)}
                  className="group w-full relative isolate overflow-hidden rounded-[22px] bg-linear-45 from-[#0b2220] via-[#102927] to-[#176b69] px-5 py-4 sm:px-6 sm:py-4.5 text-white shadow-[0_14px_32px_rgba(12,69,69,0.16)] flex flex-col justify-center gap-1.5"
                >
                  {/* Subtle glowing splash inside award card */}
                  <div
                    className="absolute -top-16 -end-16 w-[220px] h-[220px] rounded-full bg-radial from-[#3b8f8c]/35 to-transparent blur-2xl pointer-events-none"
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.06em] uppercase text-[#86dcd2] rtl:text-[13.5px]">
                      <Trophy size={13} className="text-[#86dcd2]" aria-hidden="true" />
                      <span>{featuredAchievement.badge || featuredAchievement.date || t("highlights.awardLabel")}</span>
                    </span>

                    <ArrowUpRight
                      size={16}
                      className="text-[#c5efe8] rtl:-rotate-90 transition-transform duration-180 ease-out-expo group-hover:scale-115"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-[1.025]">
                    <h3 className="m-0 mb-0.5 font-sans text-[14px] sm:text-[14.5px] font-bold leading-[1.35] text-[#86dcd2] rtl:text-[17px] rtl:sm:text-[17.5px]">
                      {featuredAchievement.title}
                    </h3>
                    <p className="m-0 text-[12.5px] leading-[1.45] text-[#cddeda] rtl:text-[15.5px]">
                      {featuredAchievement.summary}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ) : null}
          </div>
      </div>
    </section>
  );
}

export function HighlightsSectionSkeleton() {
  return (
    <section className="relative z-10 w-full pt-12 pb-14 sm:pt-14 sm:pb-16" aria-hidden="true">
      <div className="shell relative z-10">
        <div className="w-full mb-6 sm:mb-8 grid gap-2.5">
          <Skeleton className="h-3.5 w-48 rounded-full" />
          <Skeleton className="h-5 w-full rounded-full" />
          <Skeleton className="h-5 w-[86%] rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
          <div className="lg:col-span-6 grid grid-cols-3 gap-2 sm:gap-3 items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-baseline justify-start sm:justify-center gap-2.5 py-2">
                <Skeleton className="h-10 w-12 rounded-[10px]" />
                <Skeleton className="h-3.5 w-20 rounded-full" />
              </div>
            ))}
          </div>

          <div className="lg:col-span-6 rounded-[22px] bg-linear-45 from-[#0b2220] via-[#102927] to-[#176b69] px-5 py-4 sm:px-6 sm:py-5 grid gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton tone="dark" className="h-3.5 w-36 rounded-full" />
              <Skeleton tone="dark" className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton tone="dark" className="h-4.5 w-[88%] rounded-full" />
            <Skeleton tone="dark" className="h-3.5 w-[72%] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
