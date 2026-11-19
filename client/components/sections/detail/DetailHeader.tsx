import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";

type DetailHeaderProps = {
  backHref: string;
  backLabel: string;
  eyebrow?: string | null;
  title: string;
  summary?: string | null;
  children?: ReactNode;
};

/** Shared intro stage for detail pages (/projects/[slug], /publications/[id]). */
export function DetailHeader({ backHref, backLabel, eyebrow, title, summary, children }: DetailHeaderProps) {
  return (
    <div className="relative md:sticky md:top-0 z-0 w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden">
      {/* Dark band like the footer; it stays pinned while the page content slides over it */}
      <div
        className="pointer-events-none absolute -top-24 end-[-6%] w-[520px] h-[420px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/40 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 start-[-8%] w-[460px] h-[360px] rounded-full bg-radial from-[#176b69]/50 via-[#102927]/30 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="shell relative z-10">
        <Reveal immediate delay={10}>
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 mb-7 font-sans text-[13px] font-bold text-[#86dcd2] focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-4 rtl:text-[16px]"
          >
            <ArrowLeft size={15} className="rtl:rotate-180" aria-hidden="true" />
            <span className="origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-105">
              {backLabel}
            </span>
          </Link>
        </Reveal>

        <Reveal immediate delay={40}>
          {eyebrow && <p className="mono-eyebrow m-0 mb-3 text-[#86dcd2]!">{eyebrow}</p>}
          <h1 className="m-0 font-sans font-extrabold text-[clamp(28px,4vw,52px)] leading-[1.1] tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0] pb-[0.14em] bg-clip-text text-transparent">
            {title}
          </h1>
        </Reveal>

        <Reveal immediate delay={100}>
          {summary && (
            <p className="m-0 mt-5 max-w-[760px] font-sans text-[15px] sm:text-[17px] leading-[1.75] text-[#aab3b2] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
              {summary}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </div>
  );
}

export function DetailHeaderSkeleton() {
  return (
    <div
      className="w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20"
      aria-hidden="true"
    >
      <div className="shell grid gap-3">
        <Skeleton tone="dark" className="mb-4 h-4 w-32 rounded-full" />
        <Skeleton tone="dark" className="h-3.5 w-36 rounded-full" />
        <Skeleton tone="dark" className="h-11 w-[90%] max-w-[860px] rounded-[12px]" />
        <Skeleton tone="dark" className="h-11 w-[58%] max-w-[560px] rounded-[12px]" />
        <Skeleton tone="dark" className="mt-2 h-4.5 w-[62%] max-w-[620px] rounded-full" />
        <Skeleton tone="dark" className="h-4.5 w-[44%] max-w-[440px] rounded-full" />
        <Skeleton tone="dark" className="mt-3 h-3.5 w-72 max-w-full rounded-full" />
      </div>
    </div>
  );
}
