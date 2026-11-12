import { describe, expect, it } from "vitest";
import { applyProjectOverrides, applyPublicProjectOverrides, UNDER_REVIEW_OVERRIDES } from "@/lib/projectOverrides";

const djiProject = {
  slug: "rko-lio-dji-uav-gps-denied-mapping",
  title: "Demonstrating the Efficiency of RKO-LIO on a DJI UAV Platform Utilizing Drone Built-in IMU for GPS-Denied Mapping",
  status: "Research prototype",
  publication_url: "/publications/2",
  outcomes: ["Checked against real building measurements, with about 1.6% average error"],
  rich_content: "<h2>What the project is about</h2><p>...</p><h2>Checking the map</h2><p>measured on site</p>",
};

describe("public project overrides", () => {
  it("shows the DJI UAV project in full now that its paper is published", () => {
    expect(UNDER_REVIEW_OVERRIDES).toEqual({});
    expect(applyPublicProjectOverrides(djiProject)).toEqual(djiProject);
  });

  it("replaces results with a notice for a project listed as under review", () => {
    const result = applyProjectOverrides(djiProject, { [djiProject.slug]: { outcomes: ["Validated on site"], rich_content: "<h2>What the project is about</h2>" } });

    expect(result.title).toBe(djiProject.title);
    expect(result.status).toBe("Research prototype – paper under review");
    expect(result.rich_content).toContain("Paper under review");
    expect(result.rich_content).not.toContain("Checking the map");
    expect(result.outcomes.join(" ")).not.toContain("1.6%");
  });

  it("leaves other projects untouched", () => {
    const project = { slug: "autonomous-cave-exploration-drone", title: "Autonomous Cave Exploration & Obstacle-Avoidance Drone", publication_url: null, outcomes: ["Mapped a 40 m tunnel"], rich_content: "<h2>How it works</h2>" };

    expect(applyPublicProjectOverrides(project)).toEqual(project);
  });
});
