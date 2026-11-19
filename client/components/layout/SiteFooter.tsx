import { ArrowDownToLine, ArrowUpRight, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import { SITE_NAME, formatPhone } from "@/lib/site";
import type { Profile } from "@/lib/types";

type SiteFooterProps = {
  profile?: Profile | null;
};

export async function SiteFooter({ profile }: SiteFooterProps) {
  const { t, href } = await getI18n();
  const name = profile?.name || SITE_NAME;
  const email = profile?.email?.trim() || "";
  const location = profile?.location?.trim() || "";
  const githubUrl = profile?.github_url?.trim() || "";
  const linkedinUrl = profile?.linkedin_url?.trim() || "";
  const primaryCv = profile?.cv_files?.[0];
  const hasProfiles = Boolean(linkedinUrl || githubUrl);
  const hasDirectChannels = Boolean(email || profile?.phone || location);

  return (
    <footer className="w-full bg-paper px-[6px]">
      <div className="relative w-full flex flex-col md:min-h-[540px] rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] bg-[#0b2220] text-[#d7ebe6] overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-10">
        {/* Organic asymmetric mesh gradient clouds (matching Research & Publications palette) */}
        <div
          className="pointer-events-none absolute -top-28 end-[-4%] w-[560px] h-[460px] rounded-full bg-radial from-[#176b69]/75 via-[#102927]/40 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-[35%] -start-[8%] w-[500px] h-[420px] rounded-full bg-radial from-[#176b69]/50 via-[#102927]/30 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 end-[18%] w-[580px] h-[420px] rounded-full bg-radial from-[#3b8f8c]/40 via-[#176b69]/35 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="shell relative z-10 flex-1 flex flex-col justify-between">
          {/* Top Conversation & Primary CTA Band */}
          <Reveal className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-12 border-b border-white/[0.1]">
            <div className="max-w-[680px]">
              <p className="m-0 mb-3 font-sans text-[11px] font-bold tracking-[0.16em] uppercase text-[#86dcd2] rtl:text-[13.5px]">
                {t("footer.connect")}
              </p>
              <h2 className="m-0 font-sans font-extrabold text-[clamp(30px,4vw,52px)] leading-[1.06] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-white via-white to-[#a5e6de] pb-[0.14em] bg-clip-text text-transparent">
                {t("footer.heading")}
              </h2>
              <p className="m-0 mt-4 max-w-[580px] font-sans text-[14.5px] sm:text-[15.5px] leading-[1.68] text-[#aab3b2] rtl:text-[17.5px] rtl:sm:text-[19px]">
                {t("footer.body")}
              </p>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 sm:flex-wrap shrink-0">
              <Button href={href("/contact")} className="flex-1 sm:flex-none h-[46px] px-3! sm:px-6! text-[13px] rtl:text-[16px]">
                <span>{t("footer.contactMe")}</span>
                <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
              </Button>
              {primaryCv && (
                <Button
                  variant="glass"
                  href={primaryCv.file}
                  download
                  className="flex-1 sm:flex-none h-[46px] px-3! sm:px-6! text-[13px] rtl:text-[16px]"
                >
                  <span>{t("footer.downloadCv")}</span>
                  <ArrowDownToLine size={15} className="text-[#86dcd2]" aria-hidden="true" />
                </Button>
              )}
            </div>
          </Reveal>

          {/* Middle Split Row: Social Profiles (Left) & Direct Contact (Right) */}
          {(hasProfiles || hasDirectChannels) && (
            <Reveal delay={70} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10 py-8 sm:py-10">
              {/* Left: Social Profiles */}
              {hasProfiles ? (
                <div>
                  <p className="m-0 mb-4 font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-[#74c1b8] rtl:text-[13.5px]">
                    Profiles
                  </p>
                  <ul className="m-0 p-0 list-none flex flex-wrap items-center gap-x-6 gap-y-3">
                    {linkedinUrl && (
                      <li>
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-2.5 font-sans text-[14px] font-medium text-[#c2c8c8] transition-colors duration-200 hover:text-white rtl:text-[17px]"
                        >
                          <Linkedin size={15} className="text-[#86dcd2] shrink-0" aria-hidden="true" />
                          <span className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-105">
                            {t("footer.linkedin")}
                          </span>
                        </a>
                      </li>
                    )}
                    {githubUrl && (
                      <li>
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-2.5 font-sans text-[14px] font-medium text-[#c2c8c8] transition-colors duration-200 hover:text-white rtl:text-[17px]"
                        >
                          <Github size={15} className="text-[#86dcd2] shrink-0" aria-hidden="true" />
                          <span className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-105">
                            {t("footer.github")}
                          </span>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              ) : <div />}

              {/* Right: Direct Contact */}
              {hasDirectChannels && (
                <div className="sm:text-end">
                  <p className="m-0 mb-4 font-sans text-[11px] font-bold tracking-[0.14em] uppercase text-[#74c1b8] rtl:text-[13.5px]">
                    {t("footer.directChannels")}
                  </p>
                  <ul className="m-0 p-0 list-none flex flex-col gap-3 sm:items-end">
                    {email && (
                      <li>
                        <a
                          href={`mailto:${email}`}
                          className="group inline-flex items-center gap-2.5 font-sans text-[14px] font-medium text-[#c2c8c8] transition-colors duration-200 hover:text-white rtl:text-[17px]"
                        >
                          <Mail size={15} className="text-[#86dcd2] shrink-0" aria-hidden="true" />
                          <span className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-104 break-all">
                            {email}
                          </span>
                        </a>
                      </li>
                    )}
                    {profile?.phone && (
                      <li>
                        <a
                          href={`tel:${profile.phone.replace(/\s/g, "")}`}
                          className="group inline-flex items-center gap-2.5 font-sans text-[14px] font-medium text-[#c2c8c8] transition-colors duration-200 hover:text-white rtl:text-[17px]"
                        >
                          <Phone size={15} className="text-[#86dcd2] shrink-0" aria-hidden="true" />
                          <span className="transition-transform duration-180 ease-out-expo origin-left rtl:origin-right group-hover:scale-104">
                            {formatPhone(profile.phone)}
                          </span>
                        </a>
                      </li>
                    )}
                    {location && (
                      <li className="inline-flex items-center gap-2.5 font-sans text-[14px] font-medium text-[#929d9c] rtl:text-[17px]">
                        <MapPin size={15} className="text-[#6eb7af] shrink-0" aria-hidden="true" />
                        <span>{location}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </Reveal>
          )}

          {/* Bottom Signature Bar */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-sans text-[12.5px] rtl:text-[15.5px]">
              <span data-display className="font-extrabold tracking-[-0.02em] bg-linear-to-r rtl:bg-linear-to-l from-white to-[#86dcd2] pb-[0.14em] bg-clip-text text-transparent">
                {name}
              </span>
              <span className="text-[#495c5a]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#869291]">{t("footer.tagline")}</span>
            </div>

            <p className="m-0 font-sans text-[12px] text-[#798786] rtl:text-[14.5px]">
              {t("footer.rights", { year: new Date().getFullYear(), name })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooterSkeleton() {
  return (
    <footer className="w-full bg-paper px-[6px]" aria-hidden="true">
      <div className="relative w-full flex flex-col md:min-h-[540px] rounded-t-[56px] sm:rounded-t-[88px] md:rounded-t-[110px] bg-[#0b2220] overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-10">
        <div className="shell relative z-10 flex-1 flex flex-col justify-between">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 sm:pb-12 border-b border-white/[0.1]">
            <div className="max-w-[680px] w-full grid gap-3">
              <Skeleton tone="dark" className="h-3.5 w-32 rounded-full" />
              <Skeleton tone="dark" className="h-11 w-[92%] rounded-[12px]" />
              <Skeleton tone="dark" className="h-11 w-[74%] rounded-[12px]" />
              <Skeleton tone="dark" className="mt-1 h-4 w-[80%] rounded-full" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton tone="dark" className="h-[46px] w-36 rounded-full" />
              <Skeleton tone="dark" className="h-[46px] w-40 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 py-8 sm:py-10">
            {Array.from({ length: 3 }).map((_, col) => (
              <div key={col} className="grid gap-3 content-start">
                <Skeleton tone="dark" className="h-3.5 w-32 rounded-full mb-1" />
                <Skeleton tone="dark" className="h-4 w-40 rounded-full" />
                <Skeleton tone="dark" className="h-4 w-36 rounded-full" />
                <Skeleton tone="dark" className="h-4 w-44 rounded-full" />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Skeleton tone="dark" className="h-3.5 w-64 rounded-full" />
            <Skeleton tone="dark" className="h-3.5 w-44 rounded-full" />
          </div>
        </div>
      </div>
    </footer>
  );
}
