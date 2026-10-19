import { describe, expect, it } from "vitest";
import { applyPublicProjectOverrides } from "@/lib/projectOverrides";

describe("public project overrides", () => {
  it("strips the hidden publication link and generalizes the DJI UAV project's technical detail", () => {
    const project = {
      slug: "rko-lio-dji-uav-gps-denied-mapping",
      title: "Demonstrating the Efficiency of RKO-LIO on a DJI UAV Platform Utilizing Drone Built-in IMU for GPS-Denied Mapping",
      publication_url: "/publications/2",
      outcomes: ["Checked against real building measurements, with about 1.6% average error"],
      rich_content: "<h2>What the project is about</h2><p>...</p><h2>Checking the map</h2><p>measured on site</p>",
    };

    const result = applyPublicProjectOverrides(project);

    expect(result.title).toBe(project.title);
    expect(result.publication_url).toBeNull();
    expect(result.rich_content).not.toContain("Checking the map");
    expect(result.outcomes.join(" ")).not.toContain("1.6%");
  });

  it("leaves other projects untouched apart from stripping a hidden publication link", () => {
    const project = { slug: "autonomous-cave-exploration-drone", title: "Autonomous Cave Exploration & Obstacle-Avoidance Drone", publication_url: null, outcomes: ["Mapped a 40 m tunnel"], rich_content: "<h2>How it works</h2>" };

    const result = applyPublicProjectOverrides(project);

    expect(result).toEqual(project);
  });
});
