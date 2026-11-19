import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, MapPin, Trophy } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getI18n } from "@/lib/i18n/server";
import { sanitizeProjectRichContent } from "@/lib/richText";
import type { Achievement, Profile } from "@/lib/types";

export async function AchievementDetailView({
  achievement,
  profile,
}: {
  achievement: Achievement;
  profile: Profile | null;
}) {
  const { t, href } = await getI18n();
  const safeHtml = achievement.details ? sanitizeProjectRichContent(achievement.details) : "";

  return (
    <PageShell profile={profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        {/* Dark Emerald Header Stage */}
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
            <Reveal immediate>
              <Link
                href={href("/about")}
                className="inline-flex items-center gap-2 font-sans text-[12.5px] font-bold text-[#86dcd2] hover:text-white transition-colors mb-6 rtl:text-[15px]"
              >
                <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" />
                <span>{t("nav.about")}</span>
              </Link>

              <p className="m-0 mb-3 inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-[#86dcd2] rtl:text-[13.5px]">
                <Trophy size={14} aria-hidden="true" />
                <span>{achievement.badge || t("about.achievementFallback")}</span>
              </p>

              <h1 className="m-0 max-w-[920px] font-sans font-extrabold text-[clamp(30px,4.6vw,56px)] leading-[1.06] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-white via-[#cfece7] to-[#6ec6ba] pb-[0.14em] bg-clip-text text-transparent">
                {achievement.title}
              </h1>

              <p className="m-0 mt-4 max-w-[680px] font-sans text-[15px] sm:text-[17px] leading-[1.7] text-[#b4c4c2] rtl:text-[18.5px]">
                {achievement.summary}
              </p>

              {(achievement.organization || achievement.date || achievement.location) && (
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[13px] font-medium text-[#8fd4cb] rtl:text-[15px]">
                  {achievement.organization && <span>{achievement.organization}</span>}
                  {achievement.date && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar size={14} aria-hidden="true" />
                      <span>{achievement.date}</span>
                    </span>
                  )}
                  {achievement.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} aria-hidden="true" />
                      <span>{achievement.location}</span>
                    </span>
                  )}
                </div>
              )}
            </Reveal>
          </div>
        </div>

        {/* White Details Stage */}
        <section className="relative z-10 w-full bg-white rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] py-[56px] md:py-[88px]">
          <div className="shell grid gap-10 max-w-[920px]">
            {achievement.image_url ? (
              <Reveal>
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[28px] bg-[#f4f8f7]">
                  <Image
                    src={achievement.image_url}
                    alt={achievement.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 920px, 100vw"
                  />
                </div>
              </Reveal>
            ) : null}

            {safeHtml ? (
              <Reveal delay={60}>
                <article
                  className="prose prose-teal max-w-none font-sans text-[15.5px] sm:text-[16.5px] leading-[1.8] text-[#2b3f3d] rtl:text-[18.5px]"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              </Reveal>
            ) : null}

            {achievement.project_slug ? (
              <Reveal delay={90}>
                <div className="flex flex-wrap items-center gap-4 rounded-[26px] bg-[#f4f8f7] p-6">
                  <div className="flex-1 min-w-[220px]">
                    <p className="m-0 font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-teal rtl:text-[13px]">
                      {t("about.relatedProjectEyebrow")}
                    </p>
                    <p className="m-0 mt-1 font-sans text-[15px] font-bold text-[#0f2422] rtl:text-[17px]">
                      {t("about.relatedProjectBody")}
                    </p>
                  </div>
                  <Button href={href(`/projects/${achievement.project_slug}`)}>
                    <span>{t("about.exploreProjects")}</span>
                    <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                  </Button>
                </div>
              </Reveal>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
