import { describe, expect, it } from "vitest";
import { getPortfolioSnapshot } from "../lib/portfolio";
import { publicDocumentUrl, publicMediaUrl } from "../lib/supabase/server";

describe("Next.js portfolio data source", () => {
  it("loads the migrated public portfolio records from Supabase", async () => {
    const portfolio = await getPortfolioSnapshot();

    expect(portfolio.configured).toBe(true);
    expect(portfolio.profile?.name).toContain("Mohammed Bajhaw");
    expect(portfolio.publications).toHaveLength(2);
    expect(portfolio.projects).toHaveLength(9);
    expect(portfolio.skills).toHaveLength(61);
    expect(portfolio.serviceAreas).toHaveLength(6);
    expect(portfolio.serviceAreas.reduce((count, area) => count + (Array.isArray(area.services) ? area.services.length : 0), 0)).toBe(13);
    expect(portfolio.projects[0]?.imageUrl).toMatch(/supabase\.co\/storage|manus-storage/);
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.repository_url).toBe("https://github.com/MohammedBajhaw/drone-navigation");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.repository_url).toBe("https://github.com/MohammedBajhaw/Robotic-Arm-SolidWorks-Matlab");
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.imageUrl).toContain("autonomous-cave-exploration-drone");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.imageUrl).toContain("robotic-arm-cad-simulation-control");
    expect(portfolio.publications.find((publication) => publication.id === 1)?.doi).toBe("10.1109/ICHORA69329.2026.11537209");
    expect(portfolio.publications.find((publication) => publication.id === 1)?.authors).toContain("Mohammed Ali Mohammed S. Bajhaw");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-indoor-3d-mapping-platform")).toBeUndefined();
    expect(portfolio.projects.find((project) => project.slug === "offline-multi-sensor-ai-payload-for-usar")?.rich_content).toContain("Measured validation");
    expect(portfolio.projects.find((project) => project.slug === "offline-multi-sensor-ai-payload-for-usar")?.imageUrl).toContain("figure-002_42d4fde2");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-dji-uav-gps-denied-mapping")?.rich_content).toContain("Flight-test results");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-dji-uav-gps-denied-mapping")?.imageUrl).toContain("figure-005_82c208cf");
  });

  it("resolves migrated storage paths to public Supabase URLs", () => {
    expect(publicMediaUrl("migration/projects/lidar-uav-mapping_483e4614.jpg")).toContain("supabase.co/storage");
    expect(publicDocumentUrl("migration/publications/research-paper-preview_3b27fa0b.pdf")).toContain("supabase.co/storage");
    expect(publicDocumentUrl("/manus-storage/rko-lio-velodyne-pixhawk-ros2-paper_01b4facc.pdf")).toContain("engportfolio-zhkmdjuy.manus.space");
  });
});
