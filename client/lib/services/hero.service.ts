import { cache } from "react";
import { fetchHero } from "./source.api";

export type HeroData = { images: string[]; intervalSeconds: number };

/** The home page hero pictures. They come from the API only (uploaded in the studio); nothing is bundled with the site. */
export const getHero = cache(async (): Promise<HeroData> => {
  const hero = await fetchHero();
  return { images: hero?.images ?? [], intervalSeconds: hero?.intervalSeconds ?? 6 };
});
