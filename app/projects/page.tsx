import type { Metadata } from "next";
import { ProjectsArchiveContent } from "@/components/public/ProjectsArchiveContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Robotics, UAV and Embedded Systems Projects",
  description: "Projects by Mohammed Bajhaw: offline AI payload for search-and-rescue robots, GPS-denied UAV mapping with RKO-LIO, autonomous cave exploration, robotic arm control and digital fabrication.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ProjectsArchiveContent initialPortfolio={portfolio} />;
}
