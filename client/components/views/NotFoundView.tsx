import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Robot404 } from "@/components/motifs/Robot404";
import { Reveal } from "@/components/ui/Reveal";
import type { Profile } from "@/lib/types";

export type NotFoundLabels = {
  eyebrow: string;
  title: string;
  body: string;
  home: string;
  projects: string;
};

type NotFoundViewProps = {
  labels: NotFoundLabels;
  homeHref: string;
  projectsHref: string;
  profile?: Profile | null;
};

export function NotFoundView({ labels, homeHref, projectsHref, profile }: NotFoundViewProps) {
  return (
    <PageShell profile={profile} mainClassName="min-h-screen">
      <div className="w-full bg-white">
        <div className="relative w-full min-h-[84dvh] flex items-center bg-[#f2f6f5] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pt-28 pb-14 sm:pt-32 sm:pb-20 overflow-hidden">
          {/* Organic asymmetric mesh clouds in brand teal */}
          <div
            className="pointer-events-none absolute -top-24 end-[-6%] w-[560px] h-[460px] rounded-full bg-radial from-[#176b69]/18 via-[#3b8f8c]/8 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 start-[-8%] w-[480px] h-[380px] rounded-full bg-radial from-[#268c89]/14 to-transparent blur-3xl"
            aria-hidden="true"
          />

          <div className="shell relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-6">
            <div>
              <Reveal immediate delay={20}>
                <p className="mono-eyebrow m-0 mb-3">{labels.eyebrow}</p>
                <h1 className="m-0 max-w-[620px] font-sans font-extrabold text-[clamp(34px,5vw,64px)] leading-[1.04] tracking-[-0.045em] text-balance bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
                  {labels.title}
                </h1>
              </Reveal>
              <Reveal immediate delay={90}>
                <p className="m-0 mt-5 max-w-[520px] font-sans text-[15px] sm:text-[17px] leading-[1.75] text-[#526563] rtl:text-[18.5px] rtl:sm:text-[20.5px]">
                  {labels.body}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Button href={homeHref} className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
                    <span>{labels.home}</span>
                  </Button>
                  <Link
                    href={projectsHref}
                    className="group inline-flex items-center gap-1.5 font-sans text-[13px] font-bold text-teal focus-visible:outline-2 focus-visible:outline-teal focus-visible:outline-offset-4 rtl:text-[16px]"
                  >
                    <span className="origin-left rtl:origin-right transition-transform duration-180 ease-out-expo group-hover:scale-105">
                      {labels.projects}
                    </span>
                    <ArrowUpRight size={15} className="rtl:-rotate-90" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
            </div>

            <Reveal immediate delay={140} className="flex justify-center">
              <LostRobot />
            </Reveal>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/** Decorative lost robot (its screen shows 404), alone on the page, in the identity palette. */
function LostRobot() {
  return (
    <svg
      viewBox="0 0 480 420"
      className="block w-full max-w-[420px] lg:max-w-[540px] h-auto select-none"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Robot: vector artwork whose screen shows the error code; it floats gently above its own shadow */}
      <g transform="translate(240 34) scale(0.2028) translate(-1100 -377)">
        <Robot404 floatClassName="animate-float motion-reduce:animate-none" glowClassName="animate-blink motion-reduce:animate-none" />
      </g>
    </svg>
  );
}
