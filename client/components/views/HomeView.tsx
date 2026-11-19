import { PageShell } from "@/components/layout/PageShell";
import type { HomeData } from "@/lib/services";
import { Hero } from "@/components/sections/home/HeroSection";
import { HomeHighlightsSection } from "@/components/sections/home/HighlightsSection";
import { HomePublicationsSection } from "@/components/sections/home/PublicationsSection";
import { LazyHomeGallery, LazyHomeSkillsSection } from "@/components/sections/home/LazyHomeSections";
import { HomeProjectsSection } from "@/components/sections/home/ProjectsSection";

export function HomeView({ data }: { data: HomeData }) {
  return (
    <PageShell profile={data.profile}>
      {/* Continuous white page base with Sticky Hero+Highlights Curtain Reveal */}
      <div className="w-full bg-white">
        {/* Stationary unified Hero + Highlights white stage: scrolls naturally until Highlights is fully visible, then locks in place while Gallery glides over it */}
        <div className="md:sticky md:bottom-0 z-0 w-full bg-[#f2f6f5] px-3 sm:px-5 md:px-7 pb-8 sm:pb-10">
          <div className="w-full bg-white rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] shadow-[0_4px_24px_rgba(16,41,39,0.04)]">
            <Hero profile={data.profile} />
            <HomeHighlightsSection profile={data.profile} featuredAchievement={data.featuredAchievement} counts={data.counts} />
          </div>
        </div>

        {/* Moving content curtain sliding smoothly over the stationary Hero + Highlights stage */}
        <div className="relative z-10 w-full bg-white">
          <div className="w-full bg-[#f2f6f5] rounded-b-[56px] sm:rounded-b-[88px] md:rounded-b-[110px] pb-6 sm:pb-10">
            <LazyHomeGallery slides={data.gallerySlides} />
            <HomePublicationsSection publications={data.publications} />
            <LazyHomeSkillsSection skills={data.skills} />
          </div>

          {/* Projects sits directly on the pure white stage cradled by the concave outward corners above */}
          <HomeProjectsSection projects={data.projects} />
        </div>
      </div>
    </PageShell>
  );
}
