import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import { localize } from "@/lib/i18n/localize";
import type { Skill } from "@/lib/types";
import { source } from "./source";

/**
 * Skills with translated labels. `category` is the grouping key that picks each layer icon and dictionary
 * text, so it always keeps its base value.
 */
export const getSkills = cache(async (locale: Locale): Promise<Skill[]> => {
  const skills = await source.skills();
  return skills.map((skill) => ({ ...localize(skill, locale), category: skill.category })).sort((a, b) => a.sort_order - b.sort_order);
});
