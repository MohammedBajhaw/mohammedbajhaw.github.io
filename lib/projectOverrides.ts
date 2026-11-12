import { stripHiddenPublicationUrl } from "./hiddenPublications";

// While a project's paper is under review, keep the project visible but replace its quantitative
// results and validation write-up, and tell the reader that further details follow once the paper is
// published. Add an entry keyed by slug to apply this; remove it when the paper is out.
// No project needs it at the moment: the DJI UAV paper was published at ATEEC 2026.
export type UnderReviewOverride = { outcomes: string[]; rich_content: string };

export const PAPER_UNDER_REVIEW_STATUS = "Research prototype – paper under review";

export const PAPER_UNDER_REVIEW_NOTE = "<blockquote><p><strong>Paper under review.</strong> I currently have a research paper under review about this project, so some project details, such as the full results and validation, are not published here yet. They will be added once the paper is published.</p></blockquote>";

export const UNDER_REVIEW_OVERRIDES: Record<string, UnderReviewOverride> = {};

export function applyProjectOverrides<T extends Record<string, any>>(project: T, overrides: Record<string, UnderReviewOverride>): T {
  const withPublicationUrl = { ...project, publication_url: stripHiddenPublicationUrl(project.publication_url) };
  const override = overrides[project.slug];
  if (!override) return withPublicationUrl;
  return { ...withPublicationUrl, status: PAPER_UNDER_REVIEW_STATUS, outcomes: override.outcomes, rich_content: `${PAPER_UNDER_REVIEW_NOTE}${override.rich_content}` };
}

export function applyPublicProjectOverrides<T extends Record<string, any>>(project: T): T {
  return applyProjectOverrides(project, UNDER_REVIEW_OVERRIDES);
}
