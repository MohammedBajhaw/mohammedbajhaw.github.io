import { describe, expect, it } from "vitest";
import { applyPublicProjectOverrides } from "@/lib/projectOverrides";

describe("public project overrides", () => {
  it("replaces the DJI UAV project's details with an under-review notice", () => {
    const project = {
      slug: "rko-lio-dji-uav-gps-denied-mapping",
      title: "DJI UAV mapping",
      publication_url: "/publications/2",
      outcomes: ["Checked against real building measurements, with about 1.6% average error"],
      rich_content: "<h2>Checking the map</h2><p>measured on site</p>",
      project_media: [{ storage_path: "figure.jpg", sort_order: 0 }],
      imageUrl: "https://example.com/figure.jpg",
    };

    const result = applyPublicProjectOverrides(project);

    expect(result.title).toBe(project.title);
    expect(result.publication_url).toBeNull();
    expect(result.status).toBe("Research paper under review");
    expect(result.description).toContain("under review");
    expect(result.description).toContain("will be published here once the paper is published");
    expect(result.rich_content).toBe("");
    expect(result.project_media).toEqual([]);
    expect(result.imageUrl).toBeNull();
    expect(result.outcomes.join(" ")).not.toContain("1.6%");
  });

  it("leaves other projects untouched apart from stripping a hidden publication link", () => {
    const project = { slug: "autonomous-cave-exploration-drone", title: "Autonomous Cave Exploration & Obstacle-Avoidance Drone", publication_url: null, outcomes: ["Mapped a 40 m tunnel"], rich_content: "<h2>How it works</h2>" };

    const result = applyPublicProjectOverrides(project);

    expect(result).toEqual(project);
  });
});
