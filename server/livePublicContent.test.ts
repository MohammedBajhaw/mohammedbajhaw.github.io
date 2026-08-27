import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const browserReader = readFileSync(new URL("../lib/portfolioBrowser.ts", import.meta.url), "utf8");
const homeContent = readFileSync(new URL("../components/public/HomePortfolioContent.tsx", import.meta.url), "utf8");
const projectsContent = readFileSync(new URL("../components/public/ProjectsArchiveContent.tsx", import.meta.url), "utf8");
const servicesContent = readFileSync(new URL("../components/public/ServicesContent.tsx", import.meta.url), "utf8");
const projectDetailContent = readFileSync(new URL("../components/public/ProjectDetailContent.tsx", import.meta.url), "utf8");
const publicationDetailContent = readFileSync(new URL("../components/public/PublicationDetailContent.tsx", import.meta.url), "utf8");
const publicStyles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const managedMediaFunction = readFileSync(new URL("../supabase/functions/managed-project-media/index.ts", import.meta.url), "utf8");

describe("live public portfolio content", () => {
  it("reads every public portfolio collection from Supabase in the browser", () => {
    expect(browserReader).toContain('export async function getLivePortfolioSnapshot()');
    expect(browserReader).toContain('supabase.from("projects").select("*, project_media(*)")');
    expect(browserReader).toContain('supabase.from("service_areas").select("*, services(*)")');
    expect(browserReader).toContain('supabase.from("profiles").select("*")');
  });

  it("refreshes the home, projects archive, and services page after hydration", () => {
    for (const source of [homeContent, projectsContent, servicesContent]) {
      expect(source).toContain('getLivePortfolioSnapshot().then(setPortfolio)');
      expect(source).toContain('useState(initialPortfolio)');
    }
  });

  it("refreshes project and publication details with their current Supabase record", () => {
    expect(projectDetailContent).toContain('supabase.from("projects").select("*, project_media(*)").eq("slug", slug).maybeSingle()');
    expect(projectDetailContent).toContain("setProject(nextProject.data");
    expect(projectDetailContent).toContain('functions/v1/managed-project-media?path=${encodeURIComponent(path)}');
    expect(publicationDetailContent).toContain('supabase.from("publications").select("*").eq("id", publicationId).maybeSingle()');
    expect(publicationDetailContent).toContain("setPublication(nextPublication.data");
  });

  it("normalizes managed media paths and renders archive cards with a stable image frame and readable content", () => {
    expect(browserReader).toContain('`${supabaseUrl}/functions/v1/managed-project-media?path=${encodeURIComponent(path)}`');
    expect(projectsContent).toContain("ArchiveProjectCard");
    expect(projectsContent).toContain("archive-card-media");
    expect(projectsContent).toContain('onError={() => setImageUnavailable(true)}');
    expect(projectsContent).toContain("archive-card-content");
    expect(publicStyles).toContain(".archive-card-media { height: auto; aspect-ratio: 16 / 10;");
    expect(publicStyles).toContain(".archive-card-media img { object-fit: contain;");
    expect(publicStyles).toContain(".archive-grid { grid-template-columns: 1fr; gap: 18px; }");
    expect(managedMediaFunction).toContain("const MANAGED_PATH");
    expect(managedMediaFunction).toContain("Invalid project media path.");
    expect(managedMediaFunction).toContain('headers.set("content-type", contentType)');
  });

  it("preserves the original proportions of rich-content and gallery images", () => {
    expect(publicStyles).toContain(".rich-project-body figure { display: inline-block; width: fit-content");
    expect(publicStyles).toContain(".rich-project-body figure img { display: block; width: auto; height: auto");
    expect(publicStyles).toContain(".media-grid img { display: block; width: auto; height: auto; min-height: 0");
  });
});
