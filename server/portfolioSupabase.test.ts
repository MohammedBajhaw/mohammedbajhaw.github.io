import { describe, expect, it } from "vitest";
import { getPortfolioSnapshot } from "../lib/portfolio";
import { publicDocumentUrl, publicMediaUrl } from "../lib/supabase/server";

describe("Next.js portfolio data source", () => {
  it("loads the migrated public portfolio records from Supabase", async () => {
    const portfolio = await getPortfolioSnapshot();

    expect(portfolio.configured).toBe(true);
    expect(portfolio.profile?.name).toBe("Mohammed Bajhaw");
    expect(portfolio.publications).toHaveLength(2);
    expect(portfolio.projects).toHaveLength(7);
    expect(portfolio.skills).toHaveLength(61);
    expect(portfolio.serviceAreas).toHaveLength(6);
    expect(portfolio.serviceAreas.reduce((count, area) => count + (Array.isArray(area.services) ? area.services.length : 0), 0)).toBe(13);
    expect(portfolio.projects[0]?.imageUrl).toContain("supabase.co/storage");
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.repository_url).toBe("https://github.com/MohammedBajhaw/drone-navigation");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.repository_url).toBe("https://github.com/MohammedBajhaw/Robotic-Arm-SolidWorks-Matlab");
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.imageUrl).toContain("autonomous-cave-exploration-drone");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.imageUrl).toContain("robotic-arm-cad-simulation-control");
  });

  it("resolves migrated storage paths to public Supabase URLs", () => {
    expect(publicMediaUrl("migration/projects/lidar-uav-mapping_483e4614.jpg")).toContain("supabase.co/storage");
    expect(publicDocumentUrl("migration/publications/research-paper-preview_3b27fa0b.pdf")).toContain("supabase.co/storage");
  });
});
