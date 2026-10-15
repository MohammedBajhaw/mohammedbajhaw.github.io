import { describe, expect, it } from "vitest";
import { buildGallerySlides, interleaveGroups } from "../lib/gallery";

describe("home gallery ordering", () => {
  it("never places two images from the same group next to each other", () => {
    const result = interleaveGroups([["a1", "a2", "a3", "a4"], ["b1", "b2"], ["c1", "c2", "c3"]]);
    for (let i = 1; i < result.length; i += 1) expect(result[i][0]).not.toBe(result[i - 1][0]);
    expect(result.slice(0, 3)).toEqual(["a1", "b1", "c1"]);
  });

  it("mixes research figures in and keeps neighbouring slides from different sources", () => {
    const projects = [1, 2, 3].map((id) => ({ id, slug: `p${id}`, title: `Project ${id}`, project_media: [0, 1, 2].map((n) => ({ storage_path: `projects/p${id}/${n}.png`, alt: "", sort_order: n })) }));
    const publications = [{ id: 7, title: "Paper", details: '<figure><img src="https://example.com/fig-1.png" alt="Figure 1" /></figure><img src="https://example.com/fig-2.png" />' }];
    const slides = buildGallerySlides(projects, publications);
    expect(slides.some((slide) => slide.kind === "Research")).toBe(true);
    expect(slides[0].groupKey).toBe("project-1");
    for (let i = 1; i < slides.length; i += 1) expect(slides[i].groupKey).not.toBe(slides[i - 1].groupKey);
  });
});
