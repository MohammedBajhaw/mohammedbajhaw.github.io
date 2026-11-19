import type { Project, Publication } from "@/lib/types";

/** Labels that are translated in the UI; anything else (a status, a venue) is shown as written. */
export type BadgeKey =
  | "Tubitak2209"
  | "Tubitak1001"
  | "Teknofest"
  | "Fabrication"
  | "RoboticsControl"
  | "EmbeddedIot"
  | "EngineeringProject"
  | "ResearchPaper"
  | "InnovationConference";

export type GallerySlide = {
  src: string;
  alt: string;
  /** Set for slides whose text lives in the dictionary (the conference talk). */
  altKey?: "talkCloseupAlt" | "talkProfileAlt";
  kind: "Project" | "Research" | "Talk";
  /** Translated label when set, otherwise `badge` is shown as written. */
  badgeKey?: BadgeKey;
  badge: string;
  titleKey?: "talkTitle";
  title: string;
  /** Locale-less path; the component localizes it. */
  href: string;
  groupKey: string;
};


function resolveProjectBadge(project: Project): { badgeKey?: BadgeKey; badge: string } {
  const haystack = `${project.slug ?? ""} ${project.title ?? ""} ${project.subtitle ?? ""} ${project.description ?? ""}`;
  if (/t[üu]b[iİı]tak\s*2209/i.test(haystack) || /rescue|usar/i.test(haystack)) return { badgeKey: "Tubitak2209", badge: "TÜBİTAK 2209-A" };
  if (/t[üu]b[iİı]tak\s*1001/i.test(haystack) || /rko-lio|advanced-robotics|dji/i.test(haystack)) return { badgeKey: "Tubitak1001", badge: "TÜBİTAK 1001" };
  if (/teknofest/i.test(haystack)) return { badgeKey: "Teknofest", badge: "TEKNOFEST" };
  if (/cnc|fabrication/i.test(haystack)) return { badgeKey: "Fabrication", badge: "Digital Fabrication" };
  if (/robotic-arm|kinematic/i.test(haystack)) return { badgeKey: "RoboticsControl", badge: "Robotics & Control" };
  if (/iot|coffee/i.test(haystack)) return { badgeKey: "EmbeddedIot", badge: "Embedded & IoT" };
  return project.status ? { badge: String(project.status) } : { badgeKey: "EngineeringProject", badge: "Engineering Project" };
}

function mediaUrl(path?: string | null) {
  if (!path) return null;
  return path.startsWith("/") || path.startsWith("http") ? path : `/${path}`;
}

/**
 * Orders groups of images so the carousel keeps changing subject: it walks the groups in turn
 * (first image of each, then the second of each, ...) and never puts two images of the same group
 * side by side. When one group is much larger than the rest, it is picked early enough that all of
 * its images still fit between the others, so no image is dropped.
 */
export function interleaveGroups<T>(groups: T[][]): T[] {
  const queues = groups.map((items) => [...items]);
  const result: T[] = [];
  let remaining = queues.reduce((sum, queue) => sum + queue.length, 0);
  let last = -1;
  while (remaining > 0) {
    let pick = -1;
    // A group holding more than half of what is left must be used now, or it cannot be spaced out.
    for (let i = 0; i < queues.length; i += 1) {
      if (i !== last && queues[i].length * 2 > remaining) pick = i;
    }
    if (pick === -1) {
      for (let step = 1; step <= queues.length; step += 1) {
        const i = (last + step + queues.length) % queues.length;
        if (i !== last && queues[i].length > 0) { pick = i; break; }
      }
    }
    if (pick === -1) pick = queues.findIndex((queue) => queue.length > 0); // only one group left
    result.push(queues[pick].shift() as T);
    remaining -= 1;
    last = pick;
  }
  return result;
}

/** Stable identity for an image so the same file reached by two different URLs is only shown once. */
function imageKey(src: string) {
  let value = src;
  try { value = decodeURIComponent(src); } catch { /* keep raw value */ }
  value = (value.split("?path=").pop() as string).split("portfolio-media/").pop() as string;
  // Legacy files are reachable both as /manus-storage/<name> and projects/legacy/<name>.
  const legacy = /^(?:\/?manus-storage\/|projects\/legacy\/)(.+)$/.exec(value);
  return (legacy ? `legacy/${legacy[1]}` : value).toLowerCase();
}

// Diagrams, charts and plots belong on the project and paper pages, not in the photo gallery.
const DIAGRAM_FILE = /architecture|workflow|flow|chart|pipeline|framework|geometry|cascade|trajector|outcomes|validation|simulation-maps|automated-coffee-system|cnc-multi-function-system/i;
const DIAGRAM_ALT = /diagram|flowchart|architecture|chart|workflow|pipeline/i;

// Tiny originals that look blurry when enlarged.
const LOW_RESOLUTION = ["linkedin-project-3"];

function htmlImages(html: string): { src: string; alt: string }[] {
  const figures: { src: string; alt: string }[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = /\bsrc="([^"]+)"/i.exec(tag)?.[1];
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] ?? "";
    if (src) figures.push({ src, alt });
  }
  return figures;
}

function publicationFigures(publication: Publication) {
  return htmlImages(String(publication.details ?? ""));
}

const TALK_TITLE = "Presenting the rescue-robot payload";
const TALK_HREF = "/projects/autonomous-medical-search-rescue-robot";

/** Photos that are not part of any project's media: the conference talk. */
const TALK_SLIDES: GallerySlide[] = [
  { src: "/photos/talk-closeup.jpg", alt: "", altKey: "talkCloseupAlt", kind: "Talk", badgeKey: "Tubitak2209", badge: "TÜBİTAK 2209-A", titleKey: "talkTitle", title: TALK_TITLE, href: TALK_HREF, groupKey: "talk-closeup" },
  { src: "/photos/talk-profile.jpg", alt: "", altKey: "talkProfileAlt", kind: "Talk", badgeKey: "InnovationConference", badge: "Innovation Conference 2026", titleKey: "talkTitle", title: TALK_TITLE, href: TALK_HREF, groupKey: "talk-profile" },
];

export function buildGallerySlides(projects: Project[], publications: Publication[]): GallerySlide[] {
  const seen = new Set<string>();
  TALK_SLIDES.forEach((slide) => seen.add(imageKey(slide.src)));
  const take = (src: string | null, alt = "") => {
    if (!src) return false;
    if (DIAGRAM_FILE.test(imageKey(src)) || DIAGRAM_ALT.test(alt)) return false;
    const key = imageKey(src);
    if (seen.has(key) || LOW_RESOLUTION.some((name) => key.includes(name))) return false;
    seen.add(key);
    return true;
  };

  const projectGroups = projects.map((project) => {
    const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const { badgeKey, badge } = resolveProjectBadge(project);
    const candidates = [
      ...media.map((item) => ({ src: mediaUrl(item.storage_path), alt: item.alt || project.title })),
      ...htmlImages(String(project.rich_content ?? "")).map((figure) => ({ src: mediaUrl(figure.src), alt: figure.alt || project.title })),
    ];
    return candidates.flatMap(({ src, alt }): GallerySlide[] => {
      if (!take(src, alt)) return [];
      return [{ src: src as string, alt, kind: "Project", badgeKey, badge, title: project.title, href: `/projects/${project.slug}`, groupKey: `project-${project.id}` }];
    });
  });

  const researchGroups = publications.map((publication) =>
    publicationFigures(publication).flatMap((figure): GallerySlide[] => {
      if (!take(figure.src, figure.alt)) return [];
      return [{ src: figure.src, alt: figure.alt || publication.title, kind: "Research", ...(publication.venue ? { badge: String(publication.venue) } : { badgeKey: "ResearchPaper" as const, badge: "Research Paper" }), title: publication.title, href: `/publications/${publication.id}`, groupKey: `publication-${publication.id}` }];
    }),
  );

  const projectSlides = interleaveGroups([...projectGroups, ...TALK_SLIDES.map((slide) => [slide])]);
  const researchSlides = interleaveGroups(researchGroups);

  // Research figures are mixed in after every third project image.
  const slides: GallerySlide[] = [];
  let researchIndex = 0;
  projectSlides.forEach((slide, index) => {
    slides.push(slide);
    if ((index + 1) % 3 === 0 && researchIndex < researchSlides.length) slides.push(researchSlides[researchIndex++]);
  });
  while (researchIndex < researchSlides.length) slides.push(researchSlides[researchIndex++]);

  // Final guard: no two neighbouring slides from the same project or paper.
  const spaced: GallerySlide[] = [];
  const pending = [...slides];
  while (pending.length > 0) {
    const previous = spaced[spaced.length - 1]?.groupKey;
    const next = pending.findIndex((slide) => slide.groupKey !== previous);
    if (next === -1) break;
    spaced.push(pending.splice(next, 1)[0]);
  }
  return spaced;
}
