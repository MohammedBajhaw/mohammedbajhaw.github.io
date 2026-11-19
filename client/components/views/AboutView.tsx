import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Trophy } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { CvMenu } from "@/components/ui/CvMenu";
import { OrgBadge } from "@/components/ui/OrgBadge";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AboutData } from "@/lib/services";
import { getI18n } from "@/lib/i18n/server";
import { SITE_NAME } from "@/lib/site";

export async function AboutView({ data }: { data: AboutData }) {
  const { t, href } = await getI18n();
  const { profile, experiences, education, achievements, counts } = data;
  const principles = [
    { index: "01", title: t("about.principle1Title"), body: t("about.principle1Body") },
    { index: "02", title: t("about.principle2Title"), body: t("about.principle2Body") },
    { index: "03", title: t("about.principle3Title"), body: t("about.principle3Body") },
  ];
  const languages = [
    { name: t("about.languageArabic"), level: t("about.levelNative") },
    { name: t("about.languageTurkish"), level: t("about.levelTurkish") },
    { name: t("about.languageEnglish"), level: t("about.levelEnglish") },
  ];
  const name = profile?.name ?? SITE_NAME;
  const location = profile?.location || "";

  const stats = [
    { value: counts.projects, label: t("about.statProjects") },
    { value: counts.publications, label: t("about.statPublications") },
    { value: counts.skills, label: t("about.statSkills") },
  ];

  return (
    <PageShell profile={profile}>
      <div className="w-full bg-white">
        {/* Top Soft Canvas Architectural Stage */}
        <div className="w-full bg-[#f2f6f5] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pb-14 sm:pb-20">
          {/* 00 / Editorial Profile Stage (directly on #f2f6f5, no white wrapper) */}
          <div className="w-full pt-24 pb-10 sm:pt-32 sm:pb-14">
            <div className="shell">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left: Editorial Bio, Credentials, Actions & Inline Metrics */}
                  <div className="lg:col-span-7">
                    <Reveal immediate delay={20}>
                      <p className="m-0 mb-3 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                        {t("about.eyebrow")}
                      </p>
                      <h1 className="m-0 font-sans font-extrabold text-[clamp(34px,4.6vw,58px)] leading-[1.03] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] bg-clip-text text-transparent">
                        {name}.
                      </h1>
                      <p className="m-0 mt-3 font-sans text-[15px] sm:text-[17px] font-bold text-[#2b4542] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
                        {profile?.professional_title ?? t("about.titleFallback")}
                      </p>
                    </Reveal>

                    <Reveal immediate delay={80}>
                      <p className="m-0 mt-5 font-sans text-[15px] sm:text-[16.5px] leading-[1.75] text-[#526563] rtl:text-[18.5px] rtl:sm:text-[20px]">
                        {profile?.bio}
                      </p>

                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-sans text-[13.5px] font-semibold text-[#5a716e] rtl:text-[16.5px]">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={15} className="text-teal shrink-0" aria-hidden="true" />
                          <span>{location}</span>
                        </span>
                        <span className="text-[#c1d4d1]" aria-hidden="true">
                          ·
                        </span>
                        <span>{t("about.lab")}</span>
                      </div>
                    </Reveal>

                    <Reveal immediate delay={140}>
                      <div className="mt-7 flex items-center gap-2.5 sm:gap-3">
                        <Button href={href("/contact")} className="flex-1 sm:flex-none h-[46px] px-3! sm:px-7! text-[13px] rtl:text-[16px]">
                          <span>{t("about.contactMe")}</span>
                          <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                        </Button>
                        <CvMenu className="flex-1 sm:flex-none" cvFiles={profile.cv_files} />
                      </div>

                      {/* Inline Borderless Key Metrics */}
                      <div className="mt-9 pt-7 border-t border-[#dde8e6] grid grid-cols-3 gap-4 max-w-[460px]">
                        {stats.map((stat) => (
                          <div key={stat.label} className="inline-flex items-baseline gap-2">
                            <strong data-display className="font-sans font-extrabold text-[clamp(28px,3vw,38px)] leading-none tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] bg-clip-text text-transparent">
                              {stat.value}
                            </strong>
                            <span className="font-sans font-bold text-[10.5px] sm:text-[11.5px] tracking-[0.06em] uppercase text-[#4b635f] rtl:text-[13px] rtl:sm:text-[14px]">
                              {stat.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Reveal>
                  </div>

                  {/* Right: Circular Gradient-Framed Portrait */}
                  {profile?.photo_path && (
                    <Reveal immediate delay={100} className="order-first lg:order-none lg:col-span-5 flex justify-center">
                      <div className="w-full max-w-[220px] sm:max-w-[340px] rounded-full p-[2px] bg-linear-45 from-white via-[#cde5df] to-[#176b69] shadow-[0_24px_60px_rgba(12,45,44,0.12)]">
                        <div className="relative aspect-square w-full rounded-full overflow-hidden bg-[#0b1f1d]">
                          <Image
                            src={profile.photo_path}
                            alt={profile.photo_alt || t("about.portraitAlt", { name })}
                            fill
                            priority
                            sizes="340px"
                            className="object-cover object-[40%_30%]"
                          />
                        </div>
                      </div>
                    </Reveal>
                  )}
                </div>
            </div>
          </div>

          {/* 01 / Research & Engineering Experience */}
          <section className="w-full py-6 sm:py-10" aria-labelledby="about-experience-heading">
            <div className="shell">
              <Reveal className="mb-8 sm:mb-10">
                <p className="m-0 mb-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                  {t("about.experienceEyebrow")}
                </p>
                <h2
                  id="about-experience-heading"
                  className="m-0 font-sans font-extrabold text-[clamp(28px,3.6vw,46px)] leading-[1.05] tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] bg-clip-text text-transparent"
                >
                  {t("about.experienceTitle")}
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 gap-5">
                {experiences.map((item, idx) => (
                  <Reveal key={item.id} delay={idx * 65}>
                    <article className="w-full rounded-[28px] sm:rounded-[34px] bg-white border-0 p-7 sm:p-9 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-8">
                      <div className="flex md:flex-col items-baseline md:items-start justify-between md:justify-start gap-2">
                        <span className="font-sans text-[12.5px] font-extrabold tracking-[0.08em] text-teal rtl:text-[15.5px]">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sans text-[12px] font-bold tracking-[0.06em] uppercase text-[#6b7f7d] rtl:text-[14.5px]">
                          {item.start_date} — {item.end_date}
                        </span>
                      </div>

                      <div>
                        <h3 className="m-0 mb-2.5 font-sans text-[20px] sm:text-[23px] font-bold tracking-[-0.025em] text-[#0f2422]">
                          {item.role}
                        </h3>

                        <OrgBadge name={item.organization} suffix={item.location ? ` · ${item.location}` : ""} />

                        {item.summary && (
                          <p className="m-0 mt-4 font-sans text-[14.5px] leading-[1.7] text-[#526563] rtl:text-[17.5px]">
                            {item.summary}
                          </p>
                        )}

                        {Array.isArray(item.highlights) && item.highlights.length > 0 && (
                          <ul className="m-0 mt-5 pt-5 border-t border-[#e8f0ef] ps-4.5 grid gap-2.5 font-sans text-[13.5px] leading-[1.65] text-[#4c615f] list-disc marker:text-teal rtl:text-[16.5px]">
                            {item.highlights.map((h: string) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* 02 / Academic Foundation & Recognition (unified clean CV style matching Experience) */}
          <section className="w-full pt-8 sm:pt-12" aria-labelledby="about-education-heading">
            <div className="shell">
              <Reveal className="mb-8 sm:mb-10">
                <p className="m-0 mb-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                  {t("about.educationEyebrow")}
                </p>
                <h2
                  id="about-education-heading"
                  className="m-0 font-sans font-extrabold text-[clamp(28px,3.6vw,46px)] leading-[1.05] tracking-[-0.04em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] bg-clip-text text-transparent"
                >
                  {t("about.educationTitle")}
                </h2>
              </Reveal>

              <div className="grid grid-cols-1 gap-5">
                {education.map((item) => (
                  <Reveal key={item.id}>
                    <article className="w-full rounded-[28px] sm:rounded-[34px] bg-white text-ink border-0 p-7 sm:p-9 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-8">
                      <div>
                        <span className="font-sans text-[12px] font-extrabold tracking-[0.08em] uppercase text-teal rtl:text-[14.5px]">
                          {item.start_year} — {item.end_year}
                        </span>
                      </div>
                      <div>
                        <h3 className="m-0 mb-3 font-sans text-[21px] sm:text-[24px] font-bold leading-[1.25] tracking-[-0.025em] text-[#0f2422]">
                          {item.field ? t("about.degreeField", { degree: item.degree, field: item.field }) : item.degree}
                        </h3>
                        <OrgBadge
                          name={item.institution}
                          suffix={item.location ? ` · ${item.location}` : ""}
                        />
                        {item.description && (
                          <p className="m-0 mt-4 font-sans text-[14.5px] leading-[1.7] text-[#526563] rtl:text-[17.5px]">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}

                {/* Full-width horizontal 2026 Innovation Award row */}
                <Reveal delay={65}>
                  <Link
                    href={href("/projects/autonomous-medical-search-rescue-robot")}
                    className="group w-full rounded-[28px] sm:rounded-[34px] bg-white border-0 p-7 sm:p-9 text-ink grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 md:gap-8"
                  >
                    <div>
                      <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.12em] uppercase text-teal rtl:text-[13.5px]">
                        <Trophy size={14} className="text-teal shrink-0" aria-hidden="true" />
                        <span>{t("about.awardLabel")}</span>
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="m-0 mb-2.5 font-sans text-[20px] sm:text-[22px] font-bold leading-[1.3] text-[#0f2422] origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-[1.02]">
                          {t("about.awardTitle")}
                        </h3>
                        <p className="m-0 font-sans text-[14.5px] leading-[1.68] text-[#526563] rtl:text-[17.5px]">
                          {t("about.awardBody")}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 font-sans text-[12.5px] font-bold text-teal shrink-0 pt-1 rtl:text-[15.5px]">
                        <span>{t("about.awardCta")}</span>
                        <ArrowUpRight size={14} className="rtl:-rotate-90" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </div>
            </div>
          </section>
        </div>

        {/* 03 & 04 / Bottom Pure White Stage: Achievements, Languages & Engineering Principles */}
        <section className="w-full bg-white py-16 sm:py-24">
          <div className="shell grid grid-cols-1 gap-6">
            {achievements.length > 0 && (
              <Reveal>
                <div className="w-full rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 p-7 sm:p-9">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                    <div>
                      <p className="m-0 mb-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                        {t("about.achievementsEyebrow")}
                      </p>
                      <h2 className="m-0 font-sans text-[24px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-[#0f2422]">
                        {t("about.achievementsTitle")}
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((item) => (
                      <Link
                        key={String(item.id)}
                        href={href(`/achievements/${item.slug}`)}
                        className="group rounded-[22px] bg-white border-0 p-6 flex flex-col justify-between gap-3 transition-colors duration-150 hover:bg-[#eaf3f1]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-2 font-sans text-[11px] font-bold tracking-[0.08em] uppercase text-teal rtl:text-[13.5px]">
                            <Trophy size={14} aria-hidden="true" />
                            <span>{item.badge || item.date || t("about.achievementFallback")}</span>
                          </span>
                          <ArrowUpRight size={15} className="text-teal rtl:-rotate-90 transition-transform duration-180 ease-out-expo group-hover:scale-115" aria-hidden="true" />
                        </div>
                        <div className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-[1.02]">
                          <h3 className="m-0 font-sans text-[16px] sm:text-[17px] font-bold text-[#0f2422] leading-[1.35]">
                            {item.title}
                          </h3>
                          <p className="m-0 mt-1.5 font-sans text-[13.5px] leading-[1.6] text-[#526563]">
                            {item.summary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            {/* Full-width Spoken Languages */}
            <Reveal>
              <div className="w-full rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 p-7 sm:p-9">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                  <div>
                    <p className="m-0 mb-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                      {t("about.languagesEyebrow")}
                    </p>
                    <h2 className="m-0 font-sans text-[24px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-[#0f2422]">
                      {t("about.languagesTitle")}
                    </h2>
                  </div>
                  <p className="m-0 font-sans text-[13px] text-[#637876] rtl:text-[16px]">
                    {t("about.languagesNote")}
                  </p>
                </div>

                <ul className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-6">
                  {languages.map((entry) => (
                    <li key={entry.name} className="flex items-baseline justify-between gap-3 font-sans">
                      <span className="text-[15px] font-bold text-[#102927] rtl:text-[18.5px]">{entry.name}</span>
                      <span className="text-[12.5px] font-semibold text-teal rtl:text-[15.5px]">{entry.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Full-width Engineering Approach */}
            <Reveal delay={65}>
              <div className="w-full rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 p-7 sm:p-9">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                  <div>
                    <p className="m-0 mb-2 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-teal rtl:text-[13.5px]">
                      {t("about.approachEyebrow")}
                    </p>
                    <h2 className="m-0 font-sans text-[24px] sm:text-[28px] font-extrabold tracking-[-0.03em] text-[#0f2422]">
                      {t("about.approachTitle")}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 sm:flex-wrap shrink-0">
                    <Button href={href("/projects")} className="flex-1 sm:flex-none h-[44px] px-3! sm:px-6! text-[12.5px] rtl:text-[15.5px]">
                      <span>{t("about.exploreProjects")}</span>
                      <ArrowUpRight size={14} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
                    </Button>
                    <Link
                      href={href("/services")}
                      className="group inline-flex flex-1 sm:flex-none items-center justify-center h-[44px] px-3 sm:px-5 rounded-full bg-white text-[#102927] font-sans text-[12.5px] rtl:text-[15.5px] font-bold border-0"
                    >
                      <span className="inline-flex items-center gap-1.5 transition-transform duration-180 ease-out-expo group-hover:scale-105">
                        <span>{t("about.engineeringServices")}</span>
                        <ArrowUpRight size={14} className="text-teal rtl:-rotate-90" aria-hidden="true" />
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#e1ecea]">
                  {principles.map((item) => (
                    <div key={item.index}>
                      <span className="block mb-2 font-sans text-[12px] font-extrabold tracking-[0.08em] text-teal rtl:text-[14.5px]">
                        {item.index}
                      </span>
                      <h3 className="m-0 mb-1.5 font-sans text-[16.5px] font-bold text-[#0f2422] rtl:text-[20px]">{item.title}</h3>
                      <p className="m-0 font-sans text-[14px] leading-[1.65] text-[#526563] rtl:text-[17px]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export async function AboutViewSkeleton() {
  const { t } = await getI18n();
  return (
    <div className="w-full bg-white" role="status" aria-label={t("a11y.loadingAbout")}>
      <div className="w-full bg-[#f2f6f5] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pb-14 sm:pb-20">
        <div className="w-full pt-24 pb-10 sm:pt-32 sm:pb-14">
          <div className="shell grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 grid gap-3.5">
              <Skeleton className="h-3.5 w-32 rounded-full" />
              <Skeleton className="h-12 w-72 sm:w-96 rounded-[12px]" />
              <Skeleton className="h-5 w-[80%] rounded-full" />
              <Skeleton className="h-4 w-full rounded-full mt-2" />
              <Skeleton className="h-4 w-[90%] rounded-full" />
              <div className="flex gap-3 mt-4">
                <Skeleton className="h-[46px] w-36 rounded-full" />
                <Skeleton className="h-[46px] w-32 rounded-full" />
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <Skeleton className="aspect-square w-full max-w-[340px] rounded-full" />
            </div>
          </div>
        </div>

        <div className="shell grid gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[28px] bg-white p-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
              <Skeleton className="h-3.5 w-32 rounded-full" />
              <div className="grid gap-3">
                <Skeleton className="h-6 w-72 rounded-[8px]" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-[84%] rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
