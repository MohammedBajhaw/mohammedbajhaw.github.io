import type { GallerySlide } from "@/lib/gallery";
import type { Achievement, Education, Experience, Profile, Project, Publication, ServiceArea, Skill } from "@/lib/types";

/** What each page needs, so a view receives exactly its data and nothing else. */
export type HomeData = {
  profile: Profile;
  projects: Project[];
  publications: Publication[];
  skills: Skill[];
  featuredAchievement: Achievement | null;
  gallerySlides: GallerySlide[];
  hero: { images: string[]; intervalSeconds: number };
  counts: { projects: number; publications: number; skills: number };
};

export type AboutData = {
  profile: Profile;
  experiences: Experience[];
  education: Education[];
  achievements: Achievement[];
  counts: { projects: number; publications: number; skills: number };
};

export type ProjectsPageData = { profile: Profile; projects: Project[] };
export type ServicesPageData = { profile: Profile; serviceAreas: ServiceArea[] };

export type ContactData = {
  profile: Profile;
  channels: { email: string; phone: string | null; linkedinUrl: string | null; githubUrl: string | null; location: string };
};
