import { ProjectsArchiveContent } from "@/components/public/ProjectsArchiveContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export default async function ProjectsPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ProjectsArchiveContent initialPortfolio={portfolio} />;
}
