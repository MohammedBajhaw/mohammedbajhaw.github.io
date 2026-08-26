import { HomePortfolioContent } from "@/components/public/HomePortfolioContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export default async function HomePage() {
  const portfolio = await getPortfolioSnapshot();
  return <HomePortfolioContent initialPortfolio={portfolio} />;
}
