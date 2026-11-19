/**
 * Shapes of the records the site displays. They mirror what the backend will send, including the optional
 * `translations` map that carries each non-English locale's text for that record.
 */
type Translations<T> = { ar?: Partial<T>; tr?: Partial<T> };

export interface ProfileCvFile {
  label: string;
  file: string;
}

export interface Profile {
  id: string;
  owner_id: string | null;
  name: string;
  professional_title: string;
  location: string;
  email: string;
  linkedin_url: string;
  github_url?: string | null;
  phone: string;
  bio: string;
  photo_path: string | null;
  photo_alt: string | null;
  cv_files?: ProfileCvFile[];
  created_at: string;
  updated_at: string;
  translations?: Translations<Pick<Profile, "name" | "professional_title" | "location" | "bio">>;
}

export interface Education {
  id: string | number;
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  start_year: string;
  end_year: string;
  description: string | null;
  sort_order: number;
  translations?: Translations<Pick<Education, "institution" | "degree" | "field" | "location" | "description">>;
}

export interface Experience {
  id: string | number;
  role: string;
  organization: string;
  location: string | null;
  start_date: string;
  end_date: string;
  is_current: boolean;
  summary: string | null;
  highlights: string[];
  sort_order: number;
  translations?: Translations<Pick<Experience, "role" | "organization" | "location" | "start_date" | "end_date" | "summary" | "highlights">>;
}

export interface Skill {
  id: string | number;
  label: string;
  /** Grouping key (English). It picks the layer's icon and dictionary text, so it is never translated. */
  category: string;
  icon: string | null;
  sort_order: number;
  translations?: Translations<Pick<Skill, "label">>;
}

export interface ProjectMedia {
  id: string | number;
  alt: string | null;
  created_at?: string;
  project_id?: string | number;
  sort_order: number;
  storage_path: string;
  translations?: Translations<Pick<ProjectMedia, "alt">>;
}

export interface ProjectInfoRow {
  label: string;
  value: string;
}

export interface Project {
  id: string | number;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  description: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  tags: string[];
  tools: string[];
  outcomes: string[];
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** HTML article body (sanitized when rendered). */
  rich_content?: string | null;
  /** Facts shown in the info block at the top of the project page (program, role, lab, ...). */
  info?: ProjectInfoRow[];
  repository_url?: string | null;
  /** A path on this site (e.g. "/publications/3") or an external URL. */
  publication_url?: string | null;
  project_media: ProjectMedia[];
  imageUrl: string | null;
  translations?: Translations<
    Pick<Project, "title" | "subtitle" | "summary" | "description" | "status" | "end_date" | "tags" | "tools" | "outcomes" | "rich_content" | "info">
  >;
}

export interface Publication {
  id: string | number;
  title: string;
  venue: string | null;
  publication_date: string | null;
  status: string | null;
  authors: string | null;
  doi?: string | null;
  summary: string;
  /** Plain text, or HTML when it starts with a tag. */
  details: string | null;
  keywords: string[];
  /** Link to the paper's PDF, when one exists. */
  url: string | null;
  sort_order: number;
  translations?: Translations<Pick<Publication, "title" | "venue" | "publication_date" | "status" | "authors" | "summary" | "details" | "keywords">>;
}

export interface Achievement {
  id: string | number;
  slug: string;
  badge: string;
  title: string;
  summary: string;
  details?: string | null;
  date?: string | null;
  organization?: string | null;
  location?: string | null;
  project_slug?: string | null;
  image_url?: string | null;
  featured: boolean;
  sort_order: number;
  translations?: Translations<
    Pick<Achievement, "badge" | "title" | "summary" | "details" | "organization" | "location">
  >;
}

export interface Service {
  id?: string | number;
  title: string;
  area_id?: string | number;
  summary: string;
  deliverables: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  translations?: Translations<Pick<Service, "title" | "summary" | "deliverables">>;
}

export interface ServiceArea {
  id: string | number;
  title: string;
  description: string;
  accent: string;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  services: Service[];
  translations?: Translations<Pick<ServiceArea, "title" | "description">>;
}
