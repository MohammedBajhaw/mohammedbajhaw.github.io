import { describe, expect, it } from "vitest";
import { HIDDEN_PUBLICATION_IDS, isHiddenPublication, stripHiddenPublicationUrl } from "@/lib/hiddenPublications";

describe("hidden publications", () => {
  it("flags the DJI UAV publication id as hidden", () => {
    expect(HIDDEN_PUBLICATION_IDS).toEqual([2]);
    expect(isHiddenPublication(2)).toBe(true);
    expect(isHiddenPublication("2")).toBe(true);
    expect(isHiddenPublication(4)).toBe(false);
    expect(isHiddenPublication(1)).toBe(false);
    expect(isHiddenPublication(3)).toBe(false);
  });

  it("strips a project's publication link when it points at a hidden publication", () => {
    expect(stripHiddenPublicationUrl("/publications/2")).toBeNull();
    expect(stripHiddenPublicationUrl("/publications/4")).toBe("/publications/4");
    expect(stripHiddenPublicationUrl("/publications/1")).toBe("/publications/1");
    expect(stripHiddenPublicationUrl(null)).toBeNull();
    expect(stripHiddenPublicationUrl(undefined)).toBeNull();
  });
});
