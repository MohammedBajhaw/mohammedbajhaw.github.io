import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { Publication } from "@/lib/types";

function formatIndex(i: number) {
  return String(i + 1).padStart(2, "0");
}

export type PublicationCardProps = {
  publication: Publication;
  index: number;
};

export async function PublicationCard({ publication, index }: PublicationCardProps) {
  const { t, href } = await getI18n();
  const keywords: string[] = Array.isArray(publication.keywords) ? publication.keywords.slice(0, 3) : [];
  const metaRight = [publication.status, publication.publication_date].filter(Boolean).join(" · ");

  return (
    <Link
      href={href(`/publications/${publication.id}`)}
      className="group relative flex flex-col justify-between rounded-[28px] sm:rounded-[34px] p-7 sm:p-9 bg-[#f4f8f7] text-ink border-0 shadow-[0_20px_50px_rgba(0,0,0,0.28)] overflow-hidden focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2"
    >
      {/* Brand-teal inner-edge mist glow on hover (center stays pure white) */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[28px] sm:rounded-[34px] shadow-[inset_0_0_28px_rgba(23,107,105,0.28),inset_0_0_54px_rgba(38,140,137,0.16)] opacity-0 transition-opacity duration-400 ease-out group-hover:opacity-100"
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Single-line aligned top metadata row: Index + Venue on left, Status/Year on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-sans text-[13px] font-extrabold tracking-[0.08em] text-teal shrink-0 rtl:text-[16px]">
              {formatIndex(index)}
            </span>
            <span className="w-px h-3.5 bg-[#d5e2e0] shrink-0" aria-hidden="true" />
            <span className="font-sans text-[11px] sm:text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#354c4a] truncate rtl:text-[13.5px] rtl:sm:text-[14px]">
              {publication.venue}
            </span>
          </div>

          {metaRight && (
            <span className="font-sans text-[11px] font-semibold tracking-[0.06em] uppercase text-[#6b7f7d] shrink-0 whitespace-nowrap rtl:text-[13.5px]">
              {metaRight}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h3 className="mt-5 mb-3.5 font-sans font-bold text-[19px] sm:text-[22px] leading-[1.3] tracking-[-0.025em] text-[#0f2422] origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-[1.03] rtl:text-[23px]">
          {publication.title}
        </h3>

        {/* Concise Abstract / Summary */}
        <p className="m-0 font-sans text-[14px] sm:text-[14.5px] leading-[1.68] text-[#526563] rtl:text-[17px] rtl:sm:text-[17.5px]">
          {publication.summary}
        </p>
      </div>

      {/* Footer bar: Plain keywords + Unified Teal Gradient Read Paper CTA */}
      <div className="relative z-10 mt-8 pt-5 border-t border-[#e6efee] flex flex-wrap items-center justify-between gap-4 transition-colors duration-300 group-hover:border-teal/20">
        <span className="font-sans text-[12px] font-medium text-[#637876] rtl:text-[14.5px]">
          {keywords.join(" · ")}
        </span>

        <span className="inline-flex items-center justify-center rounded-full bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] px-4.5 py-2 text-[12.5px] rtl:text-[15.5px] font-semibold text-white shadow-[0_8px_20px_rgba(12,69,69,0.22)] shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span>{t("publicationsSection.readPaper")}</span>
            <ArrowUpRight size={14} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
          </span>
        </span>
      </div>
    </Link>
  );
}

export function PublicationCardSkeleton() {
  return (
    <div
      className="relative flex flex-col justify-between rounded-[28px] sm:rounded-[34px] p-7 sm:p-9 bg-[#f4f8f7] text-ink border-0 shadow-[0_20px_50px_rgba(0,0,0,0.28)] overflow-hidden"
      aria-hidden="true"
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-3.5 w-6 rounded-full shrink-0" />
            <span className="w-px h-3.5 bg-[#d5e2e0] shrink-0" />
            <Skeleton className="h-3.5 w-40 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24 rounded-full shrink-0" />
        </div>

        <div className="mt-5 mb-3.5 grid gap-2.5">
          <Skeleton className="h-6 w-[92%] rounded-[8px]" />
          <Skeleton className="h-6 w-[74%] rounded-[8px]" />
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-3.5 w-full rounded-full" />
          <Skeleton className="h-3.5 w-[94%] rounded-full" />
          <Skeleton className="h-3.5 w-[68%] rounded-full" />
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-[#e6efee] flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-3.5 w-44 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full shrink-0" />
      </div>
    </div>
  );
}
