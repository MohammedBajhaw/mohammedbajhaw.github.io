import { describe, expect, it } from "vitest";
import { getPortfolioSnapshot } from "../lib/portfolio";
import { publicDocumentUrl, publicMediaUrl } from "../lib/supabase/server";

describe("Next.js portfolio data source", () => {
  it("loads the migrated public portfolio records from Supabase", async () => {
    const portfolio = await getPortfolioSnapshot();

    expect(portfolio.configured).toBe(true);
    expect(portfolio.profile?.name).toContain("Mohammed Bajhaw");
    expect(portfolio.publications).toHaveLength(4);
    expect(portfolio.projects).toHaveLength(6);
    expect(portfolio.projects.map((project) => project.slug).slice(0, 4)).toEqual(["offline-multi-sensor-ai-payload-for-usar", "rko-lio-dji-uav-gps-denied-mapping", "autonomous-cave-exploration-drone", "robotic-arm-cad-simulation-control"]);
    expect(portfolio.projects.find((project) => project.slug === "advanced-robotics-research")).toBeUndefined();
    expect(portfolio.projects.find((project) => project.slug === "three-axis-robotic-arm")).toBeUndefined();
    expect(portfolio.skills).toHaveLength(61);
    expect(portfolio.serviceAreas).toHaveLength(6);
    expect(portfolio.serviceAreas.reduce((count, area) => count + (Array.isArray(area.services) ? area.services.length : 0), 0)).toBe(13);
    expect(portfolio.projects[0]?.imageUrl).toMatch(/supabase\.co\/storage|manus-storage/);
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.repository_url).toBe("https://github.com/MohammedBajhaw/drone-navigation");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.repository_url).toBe("https://github.com/MohammedBajhaw/Robotic-Arm-SolidWorks-Matlab");
    expect(portfolio.projects.find((project) => project.slug === "autonomous-cave-exploration-drone")?.imageUrl).toContain("tunnel-octomap");
    expect(portfolio.projects.find((project) => project.slug === "robotic-arm-cad-simulation-control")?.imageUrl).toContain("assembly-front");
    expect(portfolio.publications.find((publication) => publication.id === 1)?.doi).toBe("10.1109/ICHORA69329.2026.11537209");
    expect(portfolio.publications.find((publication) => publication.id === 1)?.authors).toContain("Mohammed Ali Mohammed S. Bajhaw");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-indoor-3d-mapping-platform")).toBeUndefined();
    expect(portfolio.projects.find((project) => project.slug === "offline-multi-sensor-ai-payload-for-usar")?.rich_content).toContain("Staying connected");
    expect(portfolio.projects.find((project) => project.slug === "offline-multi-sensor-ai-payload-for-usar")?.imageUrl).toContain("figure-002_42d4fde2");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-dji-uav-gps-denied-mapping")?.rich_content).toContain("Flying and mapping");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-dji-uav-gps-denied-mapping")?.imageUrl).toContain("figure-005_82c208cf");
    expect(portfolio.projects.find((project) => project.slug === "rko-lio-dji-uav-gps-denied-mapping")?.project_media.length).toBeGreaterThanOrEqual(5);
    expect(portfolio.publications.find((publication) => publication.doi === "10.3390/app16189083")?.url).toContain("pv-stam");
    expect(portfolio.publications.find((publication) => publication.id === 2)?.details).toContain("Key findings");

    const enrichedProjects = [
      {
        slug: "high-precision-cnc-router",
        title: "CNC Multi-Function Conversion System",
        marker: "System architecture",
      },
      {
        slug: "smart-coffee-brewing-system",
        title: "Automated Coffee Preparation System",
        marker: "System architecture",
      },
      {
        slug: "autonomous-cave-exploration-drone",
        title: "Autonomous Cave Exploration & Obstacle-Avoidance Drone",
        marker: "How it works",
        repository: "https://github.com/MohammedBajhaw/drone-navigation",
      },
      {
        slug: "robotic-arm-cad-simulation-control",
        title: "Robotic Arm: SolidWorks Design to Simscape Control",
        marker: "IntermediateMass",
        repository: "https://github.com/MohammedBajhaw/Robotic-Arm-SolidWorks-Matlab",
      },
    ];

    enrichedProjects.forEach(({ slug, title, marker, repository }) => {
      const matchingRecords = portfolio.projects.filter((project) => project.slug === slug);
      const project = matchingRecords[0];

      expect(matchingRecords).toHaveLength(1);
      expect(project?.title).toBe(title);
      expect(project?.rich_content).toContain(marker);
      if (repository) expect(project?.repository_url).toBe(repository);
    });

    expect(portfolio.projects.find((project) => project.slug === "high-precision-cnc-router")?.imageUrl).toContain("cnc-3d-model-print-original_09f25375");
  });

  it("resolves migrated storage paths to public Supabase URLs", () => {
    expect(publicMediaUrl("migration/projects/lidar-uav-mapping_483e4614.jpg")).toContain("supabase.co/storage");
    expect(publicMediaUrl("https://engportfolio-zhkmdjuy.manus.space/manus-storage/linkedin-project-3_b8ccee20.jpg")).toBe("https://engportfolio-zhkmdjuy.manus.space/manus-storage/linkedin-project-3_b8ccee20.jpg");
    expect(publicDocumentUrl("migration/publications/research-paper-preview_3b27fa0b.pdf")).toContain("supabase.co/storage");
    expect(publicDocumentUrl("/manus-storage/rko-lio-velodyne-pixhawk-ros2-paper_01b4facc.pdf")).toContain("/functions/v1/managed-project-media?path=");
    expect(publicMediaUrl("/manus-storage/cnc-3d-model-print-original_09f25375.jpg")).toContain("/functions/v1/managed-project-media?path=");
  });
});
