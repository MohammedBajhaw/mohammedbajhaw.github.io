import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { ServiceCard, ServiceCardSkeleton } from "@/components/cards/ServiceCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { ServicesPageData } from "@/lib/services";
import type { MessageKey } from "@/lib/i18n/translate";

const pad = (n: number) => String(n).padStart(2, "0");

export async function ServicesView({ data }: { data: ServicesPageData }) {
  const { t, href } = await getI18n();
  const areas = data.serviceAreas;
  const serviceCount = areas.reduce((sum, area) => sum + (area.services?.length ?? 0), 0);

  return (
    <PageShell profile={data.profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        {/* Soft canvas intro stage with the official bottom curve */}
        <div className="relative md:sticky md:top-0 z-0 w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden">
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
              <p className="mono-eyebrow m-0 mb-3 text-[#86dcd2]!">{t("services.eyebrow")}</p>
              <h1 className="m-0 max-w-[900px] font-sans font-extrabold text-[clamp(34px,5vw,64px)] leading-[1.04] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0] pb-[0.14em] bg-clip-text text-transparent">
                {t("services.title")}
              </h1>
            </Reveal>
            <Reveal immediate delay={90}>
              <p className="m-0 mt-5 max-w-[640px] font-sans text-[15px] sm:text-[17px] leading-[1.75] text-[#aab3b2] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
                {t("services.body")}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button href={href("/projects")} className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
                  <span>{t("services.discuss")}</span>
                  <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                </Button>
                <p className="m-0 font-sans text-[12px] font-bold tracking-[0.08em] uppercase text-[#929d9c] rtl:text-[14.5px]">
                  {t("services.counts", { areas: pad(areas.length), services: pad(serviceCount) })}
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Service areas sit directly on the pure white stage */}
        <section className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] py-[56px] md:py-[88px]">
          <div className="shell relative z-10 grid gap-16 md:gap-24">
            {areas.map((area, areaIdx) => {
              const services = [...(area.services ?? [])].sort((a, b) => a.sort_order - b.sort_order);
              return (
                <article
                  key={area.id}
                  className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.62fr)_minmax(0,1.38fr)] gap-8 lg:gap-14"
                >
                  <Reveal>
                    <header className="lg:sticky lg:top-28">
                      <p className="mono-eyebrow m-0 mb-3">
                        {pad(areaIdx + 1)} / {t(`services.areaKinds.${area.icon}` as MessageKey)}
                      </p>
                      <h2 className="m-0 font-sans font-extrabold text-[clamp(26px,3vw,38px)] leading-[1.08] tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
                        {area.title}
                      </h2>
                      <p className="m-0 mt-3 font-sans text-[14.5px] leading-[1.7] text-[#526563] rtl:text-[17.5px]">
                        {area.description}
                      </p>
                      <p className="m-0 mt-4 font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-[#6d827f] rtl:text-[13.5px]">
                        {services.length === 1
                          ? t("services.serviceOne", { count: pad(services.length) })
                          : t("services.serviceMany", { count: pad(services.length) })}
                      </p>
                    </header>
                  </Reveal>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {services.map((service, idx) => (
                      <Reveal key={service.id} delay={(idx % 2) * 65} className="flex">
                        <ServiceCard service={service} index={idx} />
                      </Reveal>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export async function ServicesPageSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingServices")}>
      <div className="w-full bg-[#0b2220] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="shell grid gap-3">
          <Skeleton tone="dark" className="h-3.5 w-40 rounded-full" />
          <Skeleton tone="dark" className="h-12 w-[88%] max-w-[820px] rounded-[12px]" />
          <Skeleton tone="dark" className="h-12 w-[56%] max-w-[520px] rounded-[12px]" />
          <Skeleton tone="dark" className="mt-2 h-4.5 w-[56%] max-w-[560px] rounded-full" />
          <div className="mt-3 flex items-center gap-6">
            <Skeleton tone="dark" className="h-[46px] w-48 rounded-full" />
            <Skeleton tone="dark" className="h-3.5 w-40 rounded-full" />
          </div>
        </div>
      </div>

      <section className="w-full py-[56px] md:py-[88px]">
        <div className="shell grid gap-16 md:gap-24">
          {Array.from({ length: 2 }).map((_, a) => (
            <div key={a} className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.62fr)_minmax(0,1.38fr)] gap-8 lg:gap-14">
              <div className="grid gap-3 content-start">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-9 w-[80%] rounded-[10px]" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-[75%] rounded-full" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
