import { stripHiddenPublicationUrl } from "./hiddenPublications";

// The DJI UAV project is the subject of a paper that is still under review. Keep the project
// listed, but show only a short notice until the paper is published; see lib/hiddenPublications.ts.
const SANITIZED_PROJECT_SLUG = "rko-lio-dji-uav-gps-denied-mapping";

const PAPER_UNDER_REVIEW_NOTICE = {
  status: "Research paper under review",
  subtitle: "A drone-mounted 3D mapping payload that works without GPS.",
  summary: "A 3D mapping payload for the DJI Matrice M350 RTK drone that works without GPS. A research paper on this work is currently under review.",
  description: "I currently have a research paper under review about this project. The remaining project details, including the system design, results and figures, will be published here once the paper is published.",
  outcomes: ["Research paper currently under review", "Full project details will be published after the paper is published"],
  rich_content: "",
  project_media: [],
  imageUrl: null,
};

export function applyPublicProjectOverrides<T extends Record<string, any>>(project: T): T {
  const withPublicationUrl = { ...project, publication_url: stripHiddenPublicationUrl(project.publication_url) };
  if (project.slug !== SANITIZED_PROJECT_SLUG) return withPublicationUrl;
  return { ...withPublicationUrl, ...PAPER_UNDER_REVIEW_NOTICE };
}
