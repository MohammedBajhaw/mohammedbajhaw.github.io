import type { Achievement, Education, Experience, Profile, Project, Publication, ServiceArea, Skill } from "@/lib/types";
import { apiSource } from "./source.api";

/**
 * The raw data the site needs, exactly as the backend delivers it (English base records, each with an
 * optional `translations` map). Nothing else in the app knows where it comes from: services call this and
 * only this.
 */
export interface PortfolioSource {
  profile(): Promise<Profile>;
  education(): Promise<Education[]>;
  experiences(): Promise<Experience[]>;
  skills(): Promise<Skill[]>;
  achievements(): Promise<Achievement[]>;
  projects(): Promise<Project[]>;
  publications(): Promise<Publication[]>;
  serviceAreas(): Promise<ServiceArea[]>;
}

export const source: PortfolioSource = apiSource;
