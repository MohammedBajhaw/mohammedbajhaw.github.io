import { PageShell } from "@/components/layout/PageShell";
import { FeaturedProjectCard, FeaturedProjectCardSkeleton } from "@/components/cards/FeaturedProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { ProjectsPageData } from "@/lib/services";

export async function ProjectsArchiveView({ data }: { data: ProjectsPageData }) {
  const { t } = await getI18n();
  const total = data.projects.length;

  return (
    <PageShell profile={data.profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        {/* Soft canvas intro stage with the official bottom curve */}
        <div className="relative md:sticky md:top-0 z-0 w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden">
          {/* Organic asymmetric mesh clouds (brand teal, very light on the soft canvas) */}
          <div
            className="pointer-events-none absolute -top-24 end-[-6%] w-[520px] h-[420px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/40 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 start-[-8%] w-[460px] h-[360px] rounded-full bg-radial from-[#176b69]/50 via-[#102927]/30 to-transparent blur-3xl"
            aria-hidden="true"
          />

          <div className="shell relative z-10">
            <Reveal immediate delay={20}>
              <p className="mono-eyebrow m-0 mb-3 text-[#86dcd2]!">{t("projectsPage.eyebrow")}</p>
              <h1 className="m-0 max-w-[900px] font-sans font-extrabold text-[clamp(34px,5vw,64px)] leading-[1.04] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0] pb-[0.14em] bg-clip-text text-transparent">
                {t("projectsPage.title")}
              </h1>
            </Reveal>
            <Reveal immediate delay={90}>
              <p className="m-0 mt-5 max-w-[640px] font-sans text-[15px] sm:text-[17px] leading-[1.75] text-[#aab3b2] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
                {t("projectsPage.body")}
              </p>
              <p className="m-0 mt-6 font-sans text-[12px] font-bold tracking-[0.08em] uppercase text-[#929d9c] rtl:text-[14.5px]">
                {t("projectsPage.count", { count: String(total).padStart(2, "0") })}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Projects sit directly on the pure white stage, cradled by the curve above */}
        <section className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] py-[56px] md:py-[88px]">
          <div className="shell relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {data.projects.map((project, idx) => (
                <Reveal key={project.id} delay={(idx % 3) * 65} className="flex">
                  <FeaturedProjectCard project={project} index={idx} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export async function ProjectsArchiveSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingProjects")}>
      <div className="w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="shell grid gap-3">
          <Skeleton tone="dark" className="h-3.5 w-32 rounded-full" />
          <Skeleton tone="dark" className="h-12 w-[88%] max-w-[820px] rounded-[12px]" />
          <Skeleton tone="dark" className="h-12 w-[60%] max-w-[560px] rounded-[12px]" />
          <Skeleton tone="dark" className="mt-2 h-4.5 w-[56%] max-w-[560px] rounded-full" />
          <Skeleton tone="dark" className="mt-3 h-3.5 w-40 rounded-full" />
        </div>
      </div>
      <section className="w-full py-[56px] md:py-[88px]">
        <div className="shell">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeaturedProjectCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
