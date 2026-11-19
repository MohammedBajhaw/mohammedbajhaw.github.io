/** Public surface of the data layer. Import from "@/lib/services", never from "@/lib/mock". */
export { getProfile, getAchievements, getAchievementBySlug, getAchievementSlugs } from "./profile.service";
export { getProjects, getProjectBySlug, getProjectSlugs } from "./projects.service";
export { getPublications, getPublicationById, getPublicationIds } from "./publications.service";
export { getSkills } from "./skills.service";
export { getServiceAreas } from "./serviceAreas.service";
export { getHomeData, getAboutData, getProjectsPageData, getServicesPageData, getContactData } from "./pages.service";
export type { HomeData, AboutData, ProjectsPageData, ServicesPageData, ContactData } from "./types";
