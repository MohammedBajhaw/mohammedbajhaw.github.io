import { describe, expect, it } from "vitest";
import { HIDDEN_PUBLICATION_IDS, isHiddenPublication, stripHiddenPublicationUrl } from "@/lib/hiddenPublications";

describe("hidden publications", () => {
  it("shows every publication, including the DJI UAV paper published at ATEEC 2026", () => {
    expect(HIDDEN_PUBLICATION_IDS).toEqual([]);
    for (const id of [1, 2, 3, 4, "2"]) expect(isHiddenPublication(id)).toBe(false);
  });

  it("keeps a project's publication link when it points at a visible publication", () => {
    expect(stripHiddenPublicationUrl("/publications/2")).toBe("/publications/2");
    expect(stripHiddenPublicationUrl("/publications/4")).toBe("/publications/4");
    expect(stripHiddenPublicationUrl(null)).toBeNull();
    expect(stripHiddenPublicationUrl(undefined)).toBeNull();
  });
});
