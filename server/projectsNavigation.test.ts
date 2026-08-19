import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("projects archive and public navigation", () => {
  const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
  const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
  const projectsSource = readFileSync(new URL("../client/src/pages/Projects.tsx", import.meta.url), "utf8");
  const headerSource = readFileSync(new URL("../client/src/components/PublicHeader.tsx", import.meta.url), "utf8");
  const cssSource = readFileSync(new URL("../client/src/index.css", import.meta.url), "utf8");

  it("registers a distinct projects archive before individual project details", () => {
    expect(appSource).toContain('path="/projects" component={Projects}');
    expect(appSource.indexOf('path="/projects" component={Projects}')).toBeLessThan(appSource.indexOf('path="/projects/:slug"'));
    expect(projectsSource).toContain("PROJECT ARCHIVE");
    expect(projectsSource).toContain("projects-archive-grid");
  });

  it("uses a reusable public navigation with Home, Projects, and Services", () => {
    expect(headerSource).toContain('{ label: "Home", href: "/" }');
    expect(headerSource).toContain('{ label: "Projects", href: "/projects" }');
    expect(headerSource).toContain('{ label: "Services", href: "/services" }');
    expect(headerSource).not.toContain('label: "About"');
    expect(headerSource).toContain("nav-mobile-toggle");
  });

  it("limits the home archive to six source projects and three mobile cards", () => {
    expect(homeSource).toContain("const homeProjects = data.projects.slice(0, 6)");
    expect(homeSource).toContain('href="/projects"');
    expect(cssSource).toContain(".home-projects .project-card:nth-child(n + 4)");
  });

  it("keeps skill categories in a two-column mobile layout", () => {
    expect(cssSource).toContain(".skill-category-grid { grid-template-columns: repeat(2, minmax(0, 1fr));");
  });
});
