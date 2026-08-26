import { ServicesContent } from "@/components/public/ServicesContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export default async function ServicesPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ServicesContent initialPortfolio={portfolio} />;
}
