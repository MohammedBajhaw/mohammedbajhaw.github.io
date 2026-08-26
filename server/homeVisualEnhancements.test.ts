import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeContent = readFileSync(new URL("../components/public/HomePortfolioContent.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("home page visual enhancements", () => {
  it("provides a reusable CV download route in the hero and footer", () => {
    expect(homeContent).toContain('const cvUrl = `${managedAssetHost}/manus-storage/Mohammed_Bajhaw_CV_e4b21ef0.pdf`');
    expect(homeContent).toContain('href={cvUrl} download>Download CV');
  });

  it("keeps a managed profile photo as the hero priority with a temporary fallback", () => {
    expect(homeContent).toContain('const temporaryPortraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85"');
    expect(homeContent).toContain("const heroPortrait = profile?.photo_path ?? temporaryPortraitUrl");
    expect(homeContent).toContain("const hasManagedPortrait = Boolean(profile?.photo_path)");
    expect(homeContent).toContain('className="hero-portrait"');
  });

  it("exposes an accessible case-study cue and an enhanced footer", () => {
    expect(homeContent).toContain('className="project-card-cta"');
    expect(homeContent).toContain('View case study');
    expect(homeContent).toContain('className="site-footer"');
    expect(homeContent).toContain("Building dependable systems starts with a clear engineering conversation.");
  });

  it("uses focus-visible and reduced-motion styles for the new visual interactions", () => {
    expect(styles).toContain(".project-card:focus-visible");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(".project-card:hover .project-card-cta");
  });
});
