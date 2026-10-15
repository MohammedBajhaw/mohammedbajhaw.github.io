import { describe, expect, it } from "vitest";
import { absoluteUrl, jsonLdString, truncate } from "../lib/site";
import { pageMetadata } from "../lib/seo";

describe("SEO helpers", () => {
  it("builds absolute URLs from the configured site address", () => {
    expect(absoluteUrl("/projects")).toMatch(/^https:\/\/[^/]+\/projects$/);
    expect(absoluteUrl("projects")).toBe(absoluteUrl("/projects"));
  });

  it("truncates descriptions on a word boundary and strips markup", () => {
    const text = truncate("<p>" + "robotics ".repeat(60) + "</p>", 100);
    expect(text.length).toBeLessThanOrEqual(100);
    expect(text.endsWith("…")).toBe(true);
    expect(text).not.toContain("<");
  });

  it("escapes closing script tags in JSON-LD", () => {
    expect(jsonLdString({ name: "</script><b>" })).not.toContain("</script>");
  });

  it("sets canonical, Open Graph and Twitter data for a page", () => {
    const meta = pageMetadata({ title: "Projects", description: "All projects", path: "/projects" });
    expect(meta.alternates?.canonical).toBe("/projects");
    expect(meta.openGraph?.title).toBe("Projects | Mohammed Bajhaw");
    expect((meta.twitter as { card: string }).card).toBe("summary_large_image");
  });
});
