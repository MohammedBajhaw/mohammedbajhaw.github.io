"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n/client";
import type { Profile } from "@/lib/types";

export type HeroProps = {
  profile: Profile | null;
  backgroundImage?: string;
};

export function Hero({ profile, backgroundImage = "/photos/hero-closeup-bg.jpg" }: HeroProps) {
  const { t, href } = useI18n();
  const [cvOpen, setCvOpen] = useState(false);
  const cvRef = useRef<HTMLDivElement>(null);

  const email = profile?.email?.trim() || "";
  const linkedinUrl = profile?.linkedin_url?.trim() || "";
  const githubUrl = profile?.github_url?.trim() || "";
  const cvFiles = profile?.cv_files ?? [];
  const socialLinks = [
    ...(linkedinUrl ? [{ label: t("hero.linkedin"), href: linkedinUrl, external: true }] : []),
    ...(githubUrl ? [{ label: t("hero.github"), href: githubUrl, external: true }] : []),
    ...(email ? [{ label: t("hero.email"), href: `mailto:${email}`, external: false }] : []),
  ];

  useEffect(() => {
    const handleOutside = (event: MouseEvent | KeyboardEvent) => {
      if (!cvOpen) return;
      if (event.type === "keydown" && (event as KeyboardEvent).key === "Escape") {
        setCvOpen(false);
        return;
      }
      if (event.type === "mousedown" && cvRef.current && !cvRef.current.contains(event.target as Node)) {
        setCvOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleOutside);
    };
  }, [cvOpen]);

  return (
    <section className="relative z-20 w-full h-[97dvh] min-h-[580px] px-[6px] pt-0 pb-0 mb-6 sm:mb-8 flex flex-col">
      {/* Full-bleed stage filling the device viewport height (100dvh) */}
      <div className="relative isolate w-full flex-1 flex flex-col justify-between rounded-t-none rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] bg-[#0b1f1d] pt-5 sm:pt-7 pb-5 sm:pb-6">
        {/* Background Layers (clipped strictly to the Hero's rounded bottom corners) */}
        <div
          className="absolute inset-0 -z-10 overflow-hidden rounded-t-none rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pointer-events-none"
          aria-hidden="true"
        >
          {/* 1. Base Background Image */}
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[35%_22%]"
          />

          {/* 2. Soft diagonal dark gradient reversed: from top-right towards bottom-left */}
          <div className="absolute inset-0 bg-linear-to-bl rtl:bg-linear-to-br from-[#071918]/80 via-[#0c2624]/56 to-[#102927]/28" />

          {/* 3. Subtle brand-teal highlight splash reversed: top-right to left */}
          <div className="absolute -top-20 -end-20 w-[520px] h-[520px] rounded-full bg-radial from-[#176b69]/32 via-[#176b69]/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 start-0 w-[460px] h-[360px] rounded-full bg-radial from-[#2b8a87]/18 to-transparent blur-3xl" />
        </div>

        {/* Protected inner content container (.shell) */}
        <div className="shell relative z-10 flex-1 flex flex-col pt-14 sm:pt-16">
          {/* Center content: vertically centered within the dynamic viewport height */}
          <div className="my-auto flex flex-col items-center text-center">
            {/* Headline in 2 lines glowing cleanly over the dark overlay */}
            <Reveal immediate delay={30}>
              <h1 className="max-w-[820px] mx-auto my-0 font-bold text-[clamp(26px,3.8vw,46px)] leading-[1.18] tracking-[-0.035em] bg-linear-to-r from-[#ffffff] via-[#ccece5] to-[#63bdb0] pb-[0.14em] bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(0,0,0,0.25)]">
                {t("hero.line1")}
                <br />
                {t("hero.line2")}
              </h1>
            </Reveal>

            <Reveal immediate delay={110} className="mt-8 sm:mt-10">
              <Button href={href("/about")}>
                <span>{t("hero.about")}</span>
                <ArrowUpRight size={15} className="text-[#c5efe8] rtl:-rotate-90" aria-hidden="true" />
              </Button>
            </Reveal>
          </div>

          {/* Bottom-right inside the Hero: Contact & Social links */}
          <Reveal immediate delay={170} className="flex items-center justify-center md:justify-end pb-[68px] md:pb-0 md:pe-10">
            {socialLinks.length > 0 && (
              <nav
                aria-label={t("hero.contactNav")}
                className="flex items-center gap-2.5 sm:gap-3 text-[12px] sm:text-[13px] font-semibold text-[#d0dfdc] rtl:text-[14.5px] rtl:sm:text-[16px]"
              >
                {socialLinks.map((item, idx) => (
                  <span key={item.label} className="inline-flex items-center gap-2.5 sm:gap-3">
                    {idx > 0 && (
                      <span className="text-[#456f68]" aria-hidden="true">
                        /
                      </span>
                    )}
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="hover:text-[#7fd4c6] transition-colors"
                    >
                      {item.label}
                    </a>
                  </span>
                ))}
              </nav>
            )}
          </Reveal>
        </div>

        {/* Upward curved notch carved into the bottom edge of the Hero with the circular CV button */}
        <div
          ref={cvRef}
          className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
        >
          {/* SVG smooth upward arch matching the white page background */}
          <svg
            className="block w-[164px] h-[56px] text-paper pointer-events-none select-none"
            viewBox="0 0 164 56"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 54C34 54 44 4 82 4C120 4 130 54 164 54V56H0V54Z"
              fill="currentColor"
            />
          </svg>

          {/* Circular CV button nested inside the upward notch using unified <Button shape="circle" /> */}
          <Button
            shape="circle"
            onClick={() => setCvOpen((prev) => !prev)}
            aria-expanded={cvOpen}
            aria-label={t("hero.cvAria")}
            className="absolute top-[11px]"
          >
            {t("hero.cvShort")}
          </Button>

          {/* CV language selector popover opening upward inside the Hero */}
          {cvOpen && (
            <div className="absolute bottom-[64px] left-1/2 -translate-x-1/2 z-30 min-w-[164px] rounded-2xl bg-white p-1.5 shadow-[0_14px_34px_rgba(16,41,39,0.14)] border border-black/5">
              {cvFiles.length === 0 ? (
                <p className="m-0 px-3.5 py-2 text-center font-sans text-[12px] font-medium text-[#526563] whitespace-nowrap">
                  {t("cv.none")}
                </p>
              ) : (
                cvFiles.map((cv) => {
                  const ext = cv.file.split("?")[0]?.split(".").pop()?.toUpperCase();
                  const fileBadge = ext && ext.length <= 5 ? ext : t("hero.pdf");
                  return (
                    <a
                      key={`${cv.label}-${cv.file}`}
                      href={cv.file}
                      download
                      onClick={() => setCvOpen(false)}
                      className="flex items-center justify-between gap-4 rounded-xl px-3.5 py-2 text-[12px] font-semibold text-[#102927] hover:bg-[#eef6f4] transition-colors whitespace-nowrap rtl:text-[14.5px]"
                    >
                      <span>{cv.label}</span>
                      <span className="font-sans text-[10px] font-bold text-teal rtl:text-[12px]">{fileBadge} ↓</span>
                    </a>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
