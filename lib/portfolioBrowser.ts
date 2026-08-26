"use client";

import type { PortfolioSnapshot } from "@/lib/portfolio";
import { getBrowserSupabase } from "@/lib/supabase/browser";

function publicMediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return getBrowserSupabase().storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;
}

export async function getLivePortfolioSnapshot(): Promise<PortfolioSnapshot> {
  const supabase = getBrowserSupabase();
  const [profile, education, publications, experiences, skills, projects, serviceAreas, sectionIcons] = await Promise.all([
    supabase.from("profiles").select("*").limit(1).maybeSingle(),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("publications").select("*").order("sort_order"),
    supabase.from("experiences").select("*").order("sort_order"),
    supabase.from("skills").select("*").order("category").order("sort_order"),
    supabase.from("projects").select("*, project_media(*)").order("sort_order"),
    supabase.from("service_areas").select("*, services(*)").order("sort_order"),
    supabase.from("section_icons").select("*").order("sort_order"),
  ]);

  const projectRows = (projects.data ?? []) as Record<string, any>[];
  const iconRows = (sectionIcons.data ?? []) as Record<string, any>[];

  return {
    configured: true,
    profile: profile.data,
    education: education.data ?? [],
    publications: publications.data ?? [],
    experiences: experiences.data ?? [],
    skills: skills.data ?? [],
    projects: projectRows.map((project) => ({
      ...project,
      imageUrl: publicMediaUrl(project.project_media?.[0]?.storage_path),
    })),
    serviceAreas: serviceAreas.data ?? [],
    sectionIcons: iconRows.map((icon) => ({
      ...icon,
      imageUrl: publicMediaUrl(icon.storage_path),
    })),
  };
}
