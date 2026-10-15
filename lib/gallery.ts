export type GallerySlide = {
  src: string;
  alt: string;
  kind: "Project" | "Research";
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
 * Orders groups of images so the carousel keeps changing subject: one image from each group per
 * round (rotating the starting group each round), and never the same group twice in a row.
 * Rounds stop once only one group still has images, so the tail never repeats a subject.
 */
export function interleaveGroups<T>(groups: T[][]): T[] {
  const queues = groups.map((items) => [...items]).filter((items) => items.length > 0);
  if (queues.length === 1) return queues[0];
  const result: T[] = [];
  let last = -1;
  let start = 0;
  while (queues.filter((queue) => queue.length > 0).length > 1) {
    const order = queues.map((_, i) => (i + start) % queues.length);
    for (const index of order) {
      if (queues[index].length === 0 || index === last) continue;
      result.push(queues[index].shift() as T);
      last = index;
    }
    start += 1;
  }
  return result;
}

function publicationFigures(publication: Row): { src: string; alt: string }[] {
  const html = String(publication.details ?? "");
  const figures: { src: string; alt: string }[] = [];
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = /\bsrc="([^"]+)"/i.exec(tag)?.[1];
    const alt = /\balt="([^"]*)"/i.exec(tag)?.[1] ?? "";
    if (src) figures.push({ src, alt });
  }
  return figures;
}

export function buildGallerySlides(projects: Row[], publications: Row[], limit = 18): GallerySlide[] {
  const seen = new Set<string>();
  const take = (src: string | null) => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  };

  const projectGroups = projects.map((project) => {
    const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    return media.flatMap((item): GallerySlide[] => {
      const src = mediaUrl(item.storage_path);
      if (!take(src)) return [];
      return [{ src: src as string, alt: item.alt || project.title, kind: "Project", title: project.title, href: `/projects/${project.slug}`, groupKey: `project-${project.id}` }];
    });
  });

  const researchGroups = publications.map((publication) =>
    publicationFigures(publication).flatMap((figure): GallerySlide[] => {
      if (!take(figure.src)) return [];
      return [{ src: figure.src, alt: figure.alt || publication.title, kind: "Research", title: publication.title, href: `/publications/${publication.id}`, groupKey: `publication-${publication.id}` }];
    }),
  );

  const projectSlides = interleaveGroups(projectGroups);
  const researchSlides = interleaveGroups(researchGroups);

  // Research figures are mixed in after every third project image.
  const slides: GallerySlide[] = [];
  let researchIndex = 0;
  projectSlides.forEach((slide, index) => {
    slides.push(slide);
    if ((index + 1) % 3 === 0 && researchIndex < researchSlides.length) slides.push(researchSlides[researchIndex++]);
  });
  while (researchIndex < researchSlides.length && slides.length < limit) slides.push(researchSlides[researchIndex++]);

  // Final guard: no two neighbouring slides from the same project or paper.
  const spaced: GallerySlide[] = [];
  const pending = [...slides];
  while (pending.length > 0 && spaced.length < limit) {
    const previous = spaced[spaced.length - 1]?.groupKey;
    const next = pending.findIndex((slide) => slide.groupKey !== previous);
    if (next === -1) break;
    spaced.push(pending.splice(next, 1)[0]);
  }
  return spaced;
}
