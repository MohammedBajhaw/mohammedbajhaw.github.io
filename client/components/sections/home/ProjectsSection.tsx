import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Skeleton } from "@/components/ui/Skeleton";
import { getI18n } from "@/lib/i18n/server";
import type { Project } from "@/lib/types";
import { FeaturedProjectCard, FeaturedProjectCardSkeleton } from "@/components/cards/FeaturedProjectCard";

export async function HomeProjectsSection({ projects }: { projects: Project[] }) {
  const { t, href } = await getI18n();
  return (
    <section className="relative w-full py-[72px] md:py-[104px]">
      <div className="shell relative z-10">
        <Reveal className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-9">
          <div>
            <p className="mono-eyebrow mb-2">{t("projectsSection.eyebrow")}</p>
            <h2 className="m-0 font-sans font-extrabold text-[clamp(32px,4vw,52px)] leading-[1.04] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
              {t("projectsSection.title")}
            </h2>
          </div>
          <Button href={href("/projects")}>{t("projectsSection.viewAll")}</Button>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {projects.slice(0, 6).map((project, idx) => (
            <Reveal key={project.id} delay={idx * 65} className="flex">
              <FeaturedProjectCard project={project} index={idx} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSectionSkeleton() {
  return (
    <section className="relative w-full py-[72px] md:py-[104px]" aria-hidden="true">
      <div className="shell relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-9">
          <div className="grid gap-2.5">
            <Skeleton className="h-3.5 w-36 rounded-full" />
            <Skeleton className="h-11 w-80 sm:w-[440px] rounded-[12px]" />
          </div>
          <Skeleton className="h-[50px] w-44 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <FeaturedProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
