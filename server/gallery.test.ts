import { describe, expect, it } from "vitest";
import { buildGallerySlides, interleaveGroups } from "../lib/gallery";

describe("home gallery ordering", () => {
  it("never places two images from the same group next to each other", () => {
    const result = interleaveGroups([["a1", "a2", "a3", "a4"], ["b1", "b2"], ["c1", "c2", "c3"]]);
    for (let i = 1; i < result.length; i += 1) expect(result[i][0]).not.toBe(result[i - 1][0]);
    expect(result.slice(0, 3)).toEqual(["a1", "b1", "c1"]);
    expect(result).toHaveLength(9);
  });

  it("keeps every image even when one group is much larger", () => {
    const result = interleaveGroups([Array.from({ length: 8 }, (_, i) => `big${i}`), ["x1", "x2", "x3"], ["y1", "y2", "y3", "y4"]]);
    expect(result).toHaveLength(15);
    for (let i = 1; i < result.length; i += 1) expect(result[i].slice(0, 1)).not.toBe(result[i - 1].slice(0, 1));
  });

  it("mixes research figures in and keeps neighbouring slides from different sources", () => {
    const projects = [1, 2, 3].map((id) => ({ id, slug: `p${id}`, title: `Project ${id}`, project_media: [0, 1, 2].map((n) => ({ storage_path: `projects/p${id}/${n}.png`, alt: "", sort_order: n })) }));
    const publications = [{ id: 7, title: "Paper", details: '<figure><img src="https://example.com/fig-1.png" alt="Figure 1" /></figure><img src="https://example.com/fig-2.png" />' }];
    const slides = buildGallerySlides(projects, publications);
    expect(slides.some((slide) => slide.kind === "Research")).toBe(true);
    expect(slides.filter((slide) => slide.kind === "Project")).toHaveLength(9);
    expect(slides[0].groupKey).toBe("project-1");
    for (let i = 1; i < slides.length; i += 1) expect(slides[i].groupKey).not.toBe(slides[i - 1].groupKey);
  });
});

describe("gallery excludes diagrams", () => {
  it("skips architecture diagrams, charts and plots", () => {
    const projects = [{ id: 1, slug: "p", title: "P", project_media: [], rich_content: '<img src="https://x.test/projects/p/architecture.png" alt="Diagram of the system" /><img src="https://x.test/projects/p/power-chart.png" alt="Average power" /><img src="https://x.test/projects/p/photo.jpg" alt="The robot" />' }];
    const publications = [{ id: 2, title: "Paper", details: '<img src="https://x.test/a/kitti-trajectories.png" alt="Trajectories" /><img src="https://x.test/a/platform.png" alt="The robot platform" />' }];
    const names = buildGallerySlides(projects, publications).map((slide) => slide.src.split("/").pop());
    expect(names).toContain("photo.jpg");
    expect(names).toContain("platform.png");
    expect(names).not.toContain("architecture.png");
    expect(names).not.toContain("power-chart.png");
    expect(names).not.toContain("kitti-trajectories.png");
  });
});
