import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePage = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("home page visual enhancements", () => {
  it("provides a reusable CV download route in the hero and footer", () => {
    expect(homePage).toContain('const cvUrl = `${managedAssetHost}/manus-storage/Mohammed_Bajhaw_CV_e4b21ef0.pdf`');
    expect(homePage).toContain('href={cvUrl} download>Download CV');
  });

  it("keeps a managed profile photo as the hero priority with a temporary fallback", () => {
    expect(homePage).toContain('const temporaryPortraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85"');
    expect(homePage).toContain("const heroPortrait = profile?.photo_url ?? temporaryPortraitUrl");
    expect(homePage).toContain("const hasManagedPortrait = Boolean(profile?.photo_url)");
    expect(homePage).toContain('className="hero-portrait"');
  });

  it("exposes an accessible case-study cue and an enhanced footer", () => {
    expect(homePage).toContain('className="project-card-cta"');
    expect(homePage).toContain('View case study');
    expect(homePage).toContain('className="site-footer"');
    expect(homePage).toContain("Building dependable systems starts with a clear engineering conversation.");
  });

  it("uses focus-visible and reduced-motion styles for the new visual interactions", () => {
    expect(styles).toContain(".project-card:focus-visible");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".project-card:hover .project-card-cta");
  });
});
