import type { PortfolioSource } from "./source";
import type { Achievement, Education, Experience, Profile, Project, Publication, ServiceArea, Skill } from "@/lib/types";

const API_ORIGIN = (process.env.API_ORIGIN || "http://localhost:4000").replace(/\/$/, "");

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface MaintenanceStatus {
  enabled: boolean;
  title: string;
  message: string;
  estimatedReturnAt?: string;
  allowAdminBypass: boolean;
  translations?: {
    ar?: { title?: string; message?: string };
    tr?: { title?: string; message?: string };
  };
}

const EMPTY_PROFILE: Profile = {
  id: "",
  owner_id: null,
  name: "",
  professional_title: "",
  location: "",
  email: "",
  linkedin_url: "",
  phone: "",
  bio: "",
  photo_path: null,
  photo_alt: null,
  created_at: "",
  updated_at: "",
};

async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_ORIGIN}/api${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiEnvelope<T>;
    if (!json || !json.success) return null;
    return json.data;
  } catch {
    return null;
  }
}

function normalizeProject(raw: Project): Project {
  const rawMedia = Array.isArray(raw.project_media) ? raw.project_media : [];
  const media = rawMedia.map((item, idx) => ({
    ...item,
    id: item.id ?? `${String(raw.id ?? raw.slug)}-media-${idx}`,
  }));
  const firstMediaPath = media[0]?.storage_path ?? null;
  return {
    ...raw,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    tools: Array.isArray(raw.tools) ? raw.tools : [],
    outcomes: Array.isArray(raw.outcomes) ? raw.outcomes : [],
    project_media: media,
    imageUrl: raw.imageUrl || firstMediaPath,
  };
}

export async function fetchMaintenanceStatus(): Promise<MaintenanceStatus | null> {
  return fetchApi<MaintenanceStatus>("/settings/maintenance");
}

export const apiSource: PortfolioSource = {
  async profile(): Promise<Profile> {
    const data = await fetchApi<Profile>("/profile");
    return data ?? EMPTY_PROFILE;
  },

  async education(): Promise<Education[]> {
    return (await fetchApi<Education[]>("/profile/education")) ?? [];
  },

  async experiences(): Promise<Experience[]> {
    return (await fetchApi<Experience[]>("/profile/experiences")) ?? [];
  },

  async skills(): Promise<Skill[]> {
    return (await fetchApi<Skill[]>("/profile/skills")) ?? [];
  },

  async achievements(): Promise<Achievement[]> {
    return (await fetchApi<Achievement[]>("/profile/achievements")) ?? [];
  },

  async projects(): Promise<Project[]> {
    const data = await fetchApi<Project[]>("/projects?page=1&limit=100");
    return data ? data.map(normalizeProject) : [];
  },

  async publications(): Promise<Publication[]> {
    return (await fetchApi<Publication[]>("/publications?page=1&limit=100")) ?? [];
  },

  async serviceAreas(): Promise<ServiceArea[]> {
    return (await fetchApi<ServiceArea[]>("/services?page=1&limit=100")) ?? [];
  },
};
