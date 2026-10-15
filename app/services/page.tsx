import type { Metadata } from "next";
import { ServicesContent } from "@/components/public/ServicesContent";
import { getPortfolioSnapshot } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Engineering Services",
  description: "Engineering services from Mohammed Bajhaw: robotics and autonomy, LiDAR and SLAM, embedded and edge-AI systems, mechanical design and simulation, and prototyping.",
  path: "/services",
});

export default async function ServicesPage() {
  const portfolio = await getPortfolioSnapshot();
  return <ServicesContent initialPortfolio={portfolio} />;
}
