import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("published-paper presentation", () => {
  const publicationPage = readFileSync(new URL("../components/public/PublicationDetailContent.tsx", import.meta.url), "utf8");
  const projectPage = readFileSync(new URL("../components/public/ProjectDetailContent.tsx", import.meta.url), "utf8");
  const adminConsole = readFileSync(new URL("../components/admin/AdminConsole.tsx", import.meta.url), "utf8");

  it("presents PDF, DOI, conference details, and the IEEE record on publication pages", () => {
    expect(publicationPage).toContain("publication.doi");
    expect(publicationPage).toContain("Open PDF");
    expect(publicationPage).toContain("View IEEE record");
    expect(publicationPage).toContain("Publication details");
  });

  it("links a project to its supporting publication without mislabelling it as a repository", () => {
    expect(projectPage).toContain("project.publication_url");
    expect(projectPage).toContain("Read related publication");
  });

  it("makes DOI and related-publication links editable in Content Studio", () => {
    expect(adminConsole).toContain('key: "doi"');
    expect(adminConsole).toContain('key: "publication_url"');
  });
});
