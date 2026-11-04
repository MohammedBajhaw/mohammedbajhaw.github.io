// Publications pulled from public view until officially published (accepted/in-press papers
// the author doesn't want visible yet). Remove an id here to bring it back online.
export const HIDDEN_PUBLICATION_IDS: number[] = [2];

export function isHiddenPublication(id: unknown): boolean {
  return HIDDEN_PUBLICATION_IDS.includes(Number(id));
}

export function stripHiddenPublicationUrl<T extends string | null | undefined>(url: T): T | null {
  if (!url) return url ?? null;
  const match = /^\/publications\/(\d+)$/.exec(url);
  if (match && isHiddenPublication(match[1])) return null;
  return url;
}
