import { getI18n } from "@/lib/i18n/server";
import { SiteFooterSkeleton } from "@/components/layout/SiteFooter";
import { GallerySectionSkeleton } from "@/components/sections/home/GallerySection";
import { Hero } from "@/components/sections/home/HeroSection";
import { HighlightsSectionSkeleton } from "@/components/sections/home/HighlightsSection";
import { ProjectsSectionSkeleton } from "@/components/sections/home/ProjectsSection";
import { PublicationsSectionSkeleton } from "@/components/sections/home/PublicationsSection";
import { SkillsSectionSkeleton } from "@/components/sections/home/SkillsSection";

export async function HomePageSkeleton() {
  const { t } = await getI18n();
  return (
    <div
      className="w-full bg-white"
      role="status"
      aria-label={t("a11y.loadingPortfolio")}
    >
      <div className="w-full bg-[#f2f6f5] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pb-6 sm:pb-10">
        <div className="w-full px-3 sm:px-5 md:px-7 pb-8 sm:pb-10">
          <div className="w-full bg-white rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px]">
            <Hero profile={null} />
            <HighlightsSectionSkeleton />
          </div>
        </div>
        <GallerySectionSkeleton />
        <PublicationsSectionSkeleton />
        <SkillsSectionSkeleton />
      </div>
      <ProjectsSectionSkeleton />
      <SiteFooterSkeleton />
    </div>
  );
}
