"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n/client";
import type { Project } from "@/lib/types";

function formatIndex(i: number) {
  return String(i + 1).padStart(2, "0");
}

export type FeaturedProjectCardProps = {
  project: Project;
  index: number;
};

export function FeaturedProjectCard({ project, index }: FeaturedProjectCardProps) {
  const { t, href } = useI18n();
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const mediaAlt = project.project_media?.[0]?.alt ?? project.title;
  const tags: string[] = Array.isArray(project.tags) ? project.tags.slice(0, 3) : [];
  const subtitleLead = String(project.subtitle ?? "")
    .split("·")[0]
    ?.trim();
  const primaryOutcome: string | null = project.outcomes?.[0] ?? null;

  return (
    <Link
      href={href(`/projects/${project.slug}`)}
      className="group relative flex flex-col justify-between rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-2"
    >
      {/* Inner-edge brand-teal mist glow on hover (keeps center clean & frame fixed) */}
      <span
        className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] shadow-[inset_0_0_24px_rgba(23,107,105,0.22),inset_0_0_46px_rgba(38,140,137,0.12)] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Inset Framed Visual Header with Signature Carved Concave Action Dock */}
      <div className="relative z-10 p-3 pb-0">
        <div className="relative aspect-[16/10] w-full rounded-[22px] sm:rounded-[26px] overflow-hidden bg-[#0b1f1d]">
          {project.imageUrl && !imageUnavailable ? (
            <Image
              src={project.imageUrl}
              alt={mediaAlt}
              fill
              sizes="(min-width: 1200px) 384px, (min-width: 768px) 33vw, 100vw"
              onError={() => setImageUnavailable(true)}
              className="object-cover object-center transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="grid w-full h-full place-items-center p-5 text-[#86dcd2] bg-linear-45 from-[#0b2220] via-[#102927] to-[#176b69] font-sans font-bold text-[11px] tracking-[0.1em] text-center uppercase rtl:text-[13.5px]"
              aria-label={t("projectCard.caseStudy")}
            >
              <span>{t("projectCard.caseStudy")}</span>
            </div>
          )}

          {/* Subtle top & bottom vignette for label legibility */}
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#081b1a]/45 via-transparent via-35% to-[#081b1a]/55"
            aria-hidden="true"
          />

          {/* Top-left plain status label (no background, no icon) */}
          {project.status && (
            <span className="absolute top-3.5 start-4 z-10 font-sans text-[10.5px] font-bold tracking-[0.08em] uppercase text-white whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] rtl:text-[13px]">
              {project.status}
            </span>
          )}

          {/* Signature Architectural Concave Cutout Dock (seamless borderless weld, zero shadow clipping) */}
          <div
            className="absolute -bottom-px -end-px z-20 rounded-ss-[24px] bg-[#f4f8f7] pt-2.5 ps-2.5 pe-px pb-px"
            aria-hidden="true"
          >
            {/* Top concave fillet (1px overlap into dock prevents any sub-pixel seam) */}
            <svg
              className="pointer-events-none absolute -top-[18px] end-0 w-[19px] h-[19px] rtl:-scale-x-100"
              viewBox="0 0 19 19"
              fill="none"
            >
              <path d="M 18 0 L 19 0 L 19 19 L 0 19 L 0 18 A 18 18 0 0 0 18 0 Z" fill="#f4f8f7" />
            </svg>
            {/* Left concave fillet (1px overlap into dock prevents any sub-pixel seam) */}
            <svg
              className="pointer-events-none absolute bottom-0 -start-[18px] w-[19px] h-[19px] rtl:-scale-x-100"
              viewBox="0 0 19 19"
              fill="none"
            >
              <path d="M 18 0 L 19 0 L 19 19 L 0 19 L 0 18 A 18 18 0 0 0 18 0 Z" fill="#f4f8f7" />
            </svg>

            {/* Unified Brand-Teal Circular Action Button (clean, no clipped drop-shadow) */}
            <span className="grid w-11 h-11 place-items-center rounded-full bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] text-white">
              <ArrowUpRight
                size={17}
                className="rtl:-rotate-90 transition-transform duration-180 ease-out-expo group-hover:scale-115"
              />
            </span>
          </div>
        </div>
      </div>

      {/* Editorial Body */}
      <div className="relative z-10 flex flex-col justify-between flex-1 px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
        <div>
          {/* Index + Program/Year line */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-sans text-[12px] font-extrabold tracking-[0.08em] text-teal shrink-0 rtl:text-[14.5px]">
                {formatIndex(index)}
              </span>
              {subtitleLead && (
                <>
                  <span className="w-px h-3 bg-[#cddcd9] shrink-0" aria-hidden="true" />
                  <span className="font-sans text-[11px] font-bold tracking-[0.06em] uppercase text-[#4b6461] truncate rtl:text-[13.5px]">
                    {subtitleLead}
                  </span>
                </>
              )}
            </div>

            {project.end_date && (
              <span className="font-sans text-[11px] font-semibold tracking-[0.04em] text-[#6d827f] shrink-0 rtl:text-[13.5px]">
                {project.end_date}
              </span>
            )}
          </div>

          {/* Project Title (scales smoothly on hover; preserves original dark ink) */}
          <h3 className="mt-3 mb-2.5 font-sans text-[19px] sm:text-[21px] font-bold leading-[1.28] tracking-[-0.025em] text-[#0f2422] origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-[1.03] rtl:text-[23px]">
            {project.title}
          </h3>

          {/* Concise Summary */}
          <p className="m-0 font-sans text-[14px] leading-[1.65] text-[#526563] line-clamp-3 rtl:text-[17px]">
            {project.summary}
          </p>

          {/* Headline Engineering Outcome */}
          {primaryOutcome && (
            <p className="m-0 mt-4 font-sans text-[12.5px] font-semibold leading-[1.5] text-[#284542] line-clamp-2 rtl:text-[15.5px]">
              {primaryOutcome}
            </p>
          )}
        </div>

        {/* Footer: Clean plain-text domain tags */}
        <div className="mt-6 pt-4 border-t border-[#e1ecea] flex items-center justify-between gap-3">
          <span className="font-sans text-[12px] font-medium text-[#637876] truncate rtl:text-[14.5px]">
            {tags.join(" · ")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedProjectCardSkeleton() {
  return (
    <div
      className="relative flex flex-col justify-between rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative z-10 p-3 pb-0">
        <div className="relative aspect-[16/10] w-full rounded-[22px] sm:rounded-[26px] overflow-hidden bg-black/[0.05]">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute -bottom-px -end-px z-20 rounded-ss-[24px] bg-[#f4f8f7] pt-2.5 ps-2.5 pe-px pb-px">
            <svg className="pointer-events-none absolute -top-[18px] end-0 w-[19px] h-[19px] rtl:-scale-x-100" viewBox="0 0 19 19" fill="none">
              <path d="M 18 0 L 19 0 L 19 19 L 0 19 L 0 18 A 18 18 0 0 0 18 0 Z" fill="#f4f8f7" />
            </svg>
            <svg className="pointer-events-none absolute bottom-0 -start-[18px] w-[19px] h-[19px] rtl:-scale-x-100" viewBox="0 0 19 19" fill="none">
              <path d="M 18 0 L 19 0 L 19 19 L 0 19 L 0 18 A 18 18 0 0 0 18 0 Z" fill="#f4f8f7" />
            </svg>
            <Skeleton className="w-11 h-11 rounded-full" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col justify-between flex-1 px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-3 w-6 rounded-full" />
              <span className="w-px h-3 bg-[#cddcd9]" />
              <Skeleton className="h-3 w-28 rounded-full" />
            </div>
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>

          <div className="mt-3 mb-2.5 grid gap-2">
            <Skeleton className="h-5.5 w-[88%] rounded-[8px]" />
            <Skeleton className="h-5.5 w-[62%] rounded-[8px]" />
          </div>

          <div className="grid gap-2">
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-[90%] rounded-full" />
            <Skeleton className="h-3.5 w-[70%] rounded-full" />
          </div>

          <Skeleton className="mt-4 h-3.5 w-[82%] rounded-full" />
        </div>

        <div className="mt-6 pt-4 border-t border-[#e1ecea]">
          <Skeleton className="h-3 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}
