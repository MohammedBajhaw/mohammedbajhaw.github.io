import { createPortfolioClient, isSupabaseConfigured, publicMediaUrl } from "./supabase/server";

export type PortfolioSnapshot = {
  configured: boolean;
  profile: Record<string, any> | null;
  education: Record<string, any>[];
  publications: Record<string, any>[];
  experiences: Record<string, any>[];
  skills: Record<string, any>[];
  projects: Record<string, any>[];
  serviceAreas: Record<string, any>[];
  sectionIcons: Record<string, any>[];
};

function firstMediaPath(project: Record<string, any>): string | undefined {
  const media = [...(project.project_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return media[0]?.storage_path;
}

const emptySnapshot: PortfolioSnapshot = {
  configured: false,
  profile: null,
  education: [],
  publications: [],
  experiences: [],
  skills: [],
  projects: [],
  serviceAreas: [],
  sectionIcons: [],
};

export async function getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
  if (!isSupabaseConfigured) return emptySnapshot;
  const supabase = createPortfolioClient();
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

  return {
    configured: true,
    profile: profile.data,
    education: education.data ?? [],
    publications: publications.data ?? [],
    experiences: experiences.data ?? [],
    skills: skills.data ?? [],
    projects: (projects.data ?? []).map((project) => ({
      ...project,
      imageUrl: publicMediaUrl(firstMediaPath(project)),
    })),
    serviceAreas: serviceAreas.data ?? [],
    sectionIcons: (sectionIcons.data ?? []).map((icon) => ({
      ...icon,
      imageUrl: publicMediaUrl(icon.storage_path),
    })),
  };
}
