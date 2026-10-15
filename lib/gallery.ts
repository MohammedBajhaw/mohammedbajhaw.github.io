export type GallerySlide = {
  src: string;
  alt: string;
  kind: "Project" | "Research" | "Talk";
  title: string;
  href: string;
  groupKey: string;
};

type Row = Record<string, any>;

function mediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  if (path.startsWith("/manus-storage/")) return `${base}/functions/v1/managed-project-media?path=${encodeURIComponent(path)}`;
  return `${base}/storage/v1/object/public/portfolio-media/${path}`;
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

function publicationFigures(publication: Row) {
  return htmlImages(String(publication.details ?? ""));
}

const TALK_TITLE = "Presenting the rescue-robot payload at the Creativity & Innovation Conference";
const TALK_HREF = "/projects/offline-multi-sensor-ai-payload-for-usar";

/** Photos that are not part of any project's media: the conference talk. */
const TALK_SLIDES: GallerySlide[] = [
  { src: "/photos/talk-closeup.jpg", alt: "Mohammed presenting the problems facing rescue robots on stage at the Creativity and Innovation Conference", kind: "Talk", title: TALK_TITLE, href: TALK_HREF, groupKey: "talk-closeup" },
  { src: "/photos/talk-profile.jpg", alt: "Mohammed speaking in front of the conference slides", kind: "Talk", title: TALK_TITLE, href: TALK_HREF, groupKey: "talk-profile" },
];

export function buildGallerySlides(projects: Row[], publications: Row[]): GallerySlide[] {
  const seen = new Set<string>();
  const take = (src: string | null) => {
    if (!src) return false;
    const key = imageKey(src);
    if (seen.has(key) || LOW_RESOLUTION.some((name) => key.includes(name))) return false;
    seen.add(key);
    return true;
  };

  const projectGroups = projects.map((project) => {
    const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const candidates = [
      ...media.map((item) => ({ src: mediaUrl(item.storage_path), alt: item.alt || project.title })),
      ...htmlImages(String(project.rich_content ?? "")).map((figure) => ({ src: mediaUrl(figure.src), alt: figure.alt || project.title })),
    ];
    return candidates.flatMap(({ src, alt }): GallerySlide[] => {
      if (!take(src)) return [];
      return [{ src: src as string, alt, kind: "Project", title: project.title, href: `/projects/${project.slug}`, groupKey: `project-${project.id}` }];
    });
  });

  const researchGroups = publications.map((publication) =>
    publicationFigures(publication).flatMap((figure): GallerySlide[] => {
      if (!take(figure.src)) return [];
      return [{ src: figure.src, alt: figure.alt || publication.title, kind: "Research", title: publication.title, href: `/publications/${publication.id}`, groupKey: `publication-${publication.id}` }];
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
