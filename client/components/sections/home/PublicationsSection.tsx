import { PublicationCard, PublicationCardSkeleton } from "@/components/cards/PublicationCard";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { Publication } from "@/lib/types";

export async function HomePublicationsSection({ publications }: { publications: Publication[] }) {
  if (!publications.length) return null;
  const { t } = await getI18n();

  return (
    <section
      id="publications"
      className="relative z-10 w-full px-3 sm:px-5 md:px-7 py-6 sm:py-10"
      aria-labelledby="publications-heading"
    >
      {/* Monumental Obsidian-Teal Prestige Stage with organic mesh gradient */}
      <div className="relative w-full rounded-[40px] sm:rounded-[56px] md:rounded-[72px] bg-[#0b2220] text-white overflow-hidden py-16 sm:py-24 md:py-28 shadow-[0_28px_72px_rgba(12,69,69,0.22)]">
        {/* Organic asymmetric mesh gradient clouds (exact Award Card palette: #0b2220, #102927, #176b69, #3b8f8c) */}
        <div
          className="pointer-events-none absolute -top-32 end-[-6%] w-[620px] h-[520px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/45 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[28%] -start-[8%] w-[560px] h-[480px] rounded-full bg-radial from-[#176b69]/55 via-[#102927]/35 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-36 end-[14%] w-[680px] h-[500px] rounded-full bg-radial from-[#3b8f8c]/45 via-[#176b69]/40 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[12%] start-[38%] w-[460px] h-[380px] rounded-full bg-radial from-[#102927]/90 via-[#176b69]/28 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="shell relative z-10">
          {/* Prestige Editorial Header */}
          <Reveal className="mb-12 sm:mb-16 pb-8 border-b border-white/[0.1]">
            <p className="m-0 mb-3 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-[#86dcd2] rtl:text-[13.5px]">
              {t("publicationsSection.eyebrow")}
            </p>
            <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4">
              <h2
                id="publications-heading"
                className="m-0 font-sans font-extrabold text-[clamp(34px,4.5vw,56px)] leading-[1.03] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-white via-white to-[#a5e6de] pb-[0.14em] bg-clip-text text-transparent"
              >
                {t("publicationsSection.title")}
              </h2>
              <p className="m-0 font-sans text-[11.5px] font-bold tracking-[0.1em] uppercase text-[#7acac1] shrink-0 rtl:text-[14px]">
                {t("publicationsSection.venues")}
              </p>
            </div>
            <p className="m-0 mt-4 w-full font-sans text-[14.5px] sm:text-[15.5px] leading-[1.65] text-[#aab3b2] rtl:text-[17.5px] rtl:sm:text-[19px]">
              {t("publicationsSection.description")}
            </p>
          </Reveal>

          {/* Balanced 2x2 Academic Monograph Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {publications.map((item, idx) => (
              <Reveal key={item.id} delay={idx * 65} className="flex">
                <PublicationCard publication={item} index={idx} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PublicationsSectionSkeleton() {
  return (
    <section className="relative z-10 w-full px-3 sm:px-5 md:px-7 py-6 sm:py-10" aria-hidden="true">
      <div className="relative w-full rounded-[40px] sm:rounded-[56px] md:rounded-[72px] bg-[#0b2220] text-white overflow-hidden py-16 sm:py-24 md:py-28 shadow-[0_28px_72px_rgba(12,69,69,0.22)]">
        <div className="shell relative z-10">
          <div className="mb-12 sm:mb-16 pb-8 border-b border-white/[0.1] grid gap-4">
            <Skeleton tone="dark" className="h-3.5 w-44 rounded-full" />
            <div className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4">
              <Skeleton tone="dark" className="h-12 w-80 sm:w-96 rounded-[12px]" />
              <Skeleton tone="dark" className="h-3.5 w-64 rounded-full shrink-0" />
            </div>
            <Skeleton tone="dark" className="h-4.5 w-[92%] rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <PublicationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
