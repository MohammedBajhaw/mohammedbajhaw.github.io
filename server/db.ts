import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  education,
  experiences,
  InsertUser,
  profiles,
  projectMedia,
  projects,
  publications,
  sectionIcons,
  serviceAreas,
  services,
  skills,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { portfolioSeed } from "./portfolioSeed";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensurePortfolioSeed() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select({ id: profiles.id }).from(profiles).limit(1);
  if (!existing.length) {
    await db.insert(profiles).values(portfolioSeed.profile);
    await db.insert(education).values(portfolioSeed.education);
    await db.insert(publications).values(portfolioSeed.publications);
    await db.insert(experiences).values(portfolioSeed.experiences);
    await db.insert(skills).values(portfolioSeed.skills);
    await db.insert(projects).values(portfolioSeed.projects);
    const insertedProjects = await db.select().from(projects);
    const projectIdBySlug = new Map(insertedProjects.map((project) => [project.slug, project.id]));
    await db.insert(projectMedia).values(
      portfolioSeed.media.map((item) => ({
        projectId: projectIdBySlug.get(item.slug)!,
        url: item.url,
        storageKey: null,
        alt: item.alt,
        sortOrder: item.sortOrder,
      })),
    );
  }
  const existingIcons = await db.select({ id: sectionIcons.id }).from(sectionIcons).limit(1);
  if (!existingIcons.length) await db.insert(sectionIcons).values(portfolioSeed.sectionIcons);
  const existingServiceAreas = await db.select({ title: serviceAreas.title }).from(serviceAreas);
  const existingServiceAreaTitles = new Set(existingServiceAreas.map((area) => area.title));
  const missingServiceAreas = portfolioSeed.serviceAreas.filter((area) => !existingServiceAreaTitles.has(area.title));
  if (missingServiceAreas.length) await db.insert(serviceAreas).values(missingServiceAreas);
  const storedServiceAreas = await db.select({ id: serviceAreas.id, title: serviceAreas.title }).from(serviceAreas);
  const serviceAreaIdByTitle = new Map(storedServiceAreas.map((area) => [area.title, area.id]));
  const existingServices = await db.select({ title: services.title }).from(services);
  const existingServiceTitles = new Set(existingServices.map((service) => service.title));
  const missingServices = portfolioSeed.services.filter((service) => !existingServiceTitles.has(service.title));
  if (missingServices.length) await db.insert(services).values(missingServices.map((service) => ({ areaId: serviceAreaIdByTitle.get(service.areaTitle)!, title: service.title, summary: service.summary, deliverables: service.deliverables, sortOrder: service.sortOrder })));
}

export async function getPublicPortfolio() {
  await ensurePortfolioSeed();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const [profileRows, educationRows, publicationRows, experienceRows, skillRows, sectionIconRows, serviceAreaRows, serviceRows, projectRows, mediaRows] = await Promise.all([
    db.select().from(profiles).limit(1),
    db.select().from(education).orderBy(asc(education.sortOrder)),
    db.select().from(publications).orderBy(asc(publications.sortOrder)),
    db.select().from(experiences).orderBy(asc(experiences.sortOrder)),
    db.select().from(skills).orderBy(asc(skills.sortOrder)),
    db.select().from(sectionIcons).orderBy(asc(sectionIcons.sortOrder)),
    db.select().from(serviceAreas).orderBy(asc(serviceAreas.sortOrder)),
    db.select().from(services).orderBy(asc(services.sortOrder)),
    db.select().from(projects).orderBy(asc(projects.sortOrder)),
    db.select().from(projectMedia).orderBy(asc(projectMedia.sortOrder)),
  ]);
  return {
    profile: profileRows[0],
    education: educationRows,
    publications: publicationRows,
    experiences: experienceRows,
    skills: skillRows,
    sectionIcons: sectionIconRows,
    serviceAreas: serviceAreaRows.map((area) => ({ ...area, services: serviceRows.filter((service) => service.areaId === area.id) })),
    projects: projectRows.map((project) => ({ ...project, media: mediaRows.filter((media) => media.projectId === project.id) })),
  };
}

export async function getContent(type: string) {
  await ensurePortfolioSeed();
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  switch (type) {
    case "profile": return (await db.select().from(profiles).limit(1))[0];
    case "education": return db.select().from(education).orderBy(asc(education.sortOrder));
    case "publications": return db.select().from(publications).orderBy(asc(publications.sortOrder));
    case "experiences": return db.select().from(experiences).orderBy(asc(experiences.sortOrder));
    case "skills": return db.select().from(skills).orderBy(asc(skills.sortOrder));
    case "icons": return db.select().from(sectionIcons).orderBy(asc(sectionIcons.sortOrder));
    case "serviceAreas": return db.select().from(serviceAreas).orderBy(asc(serviceAreas.sortOrder));
    case "services": return db.select().from(services).orderBy(asc(services.sortOrder));
    case "projects": return db.select().from(projects).orderBy(asc(projects.sortOrder));
    case "media": return db.select().from(projectMedia).orderBy(asc(projectMedia.sortOrder));
    default: throw new Error("Unknown content type");
  }
}

const stringValue = (value: unknown) => (typeof value === "string" ? value : "");
const nullableString = (value: unknown) => (typeof value === "string" && value.trim() ? value : null);
const numberValue = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);
const boolValue = (value: unknown) => value === true || value === "true";
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function saveContent(type: string, rawData: Record<string, unknown>) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const id = numberValue(rawData.id);
  if (type === "profile") {
    const values = {
      name: stringValue(rawData.name), professionalTitle: stringValue(rawData.professionalTitle), location: nullableString(rawData.location),
      email: nullableString(rawData.email), linkedinUrl: nullableString(rawData.linkedinUrl), bio: nullableString(rawData.bio),
      photoUrl: nullableString(rawData.photoUrl), photoKey: nullableString(rawData.photoKey),
    };
    await db.insert(profiles).values({ id: 1, ...values }).onDuplicateKeyUpdate({ set: values });
    return;
  }
  if (type === "education") {
    const values = { institution: stringValue(rawData.institution), degree: stringValue(rawData.degree), field: nullableString(rawData.field), location: nullableString(rawData.location), startYear: nullableString(rawData.startYear), endYear: nullableString(rawData.endYear), description: nullableString(rawData.description), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(education).set(values).where(eq(education.id, id)); else await db.insert(education).values(values);
    return;
  }
  if (type === "publications") {
    const values = { title: stringValue(rawData.title), venue: nullableString(rawData.venue), publicationDate: nullableString(rawData.publicationDate), status: nullableString(rawData.status), authors: nullableString(rawData.authors), summary: nullableString(rawData.summary), details: nullableString(rawData.details), keywords: stringArray(rawData.keywords), url: nullableString(rawData.url), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(publications).set(values).where(eq(publications.id, id)); else await db.insert(publications).values(values);
    return;
  }
  if (type === "experiences") {
    const values = { role: stringValue(rawData.role), organization: stringValue(rawData.organization), location: nullableString(rawData.location), startDate: nullableString(rawData.startDate), endDate: nullableString(rawData.endDate), isCurrent: boolValue(rawData.isCurrent), summary: nullableString(rawData.summary), highlights: stringArray(rawData.highlights), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(experiences).set(values).where(eq(experiences.id, id)); else await db.insert(experiences).values(values);
    return;
  }
  if (type === "skills") {
    const values = { label: stringValue(rawData.label), category: stringValue(rawData.category), icon: nullableString(rawData.icon), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(skills).set(values).where(eq(skills.id, id)); else await db.insert(skills).values(values);
    return;
  }
  if (type === "icons") {
    const values = { sectionKey: stringValue(rawData.sectionKey), label: stringValue(rawData.label), url: stringValue(rawData.url), storageKey: nullableString(rawData.storageKey), alt: nullableString(rawData.alt), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(sectionIcons).set(values).where(eq(sectionIcons.id, id)); else await db.insert(sectionIcons).values(values);
    return;
  }
  if (type === "serviceAreas") {
    const values = { title: stringValue(rawData.title), description: nullableString(rawData.description), accent: stringValue(rawData.accent) || "teal", icon: stringValue(rawData.icon) || "robotics", sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(serviceAreas).set(values).where(eq(serviceAreas.id, id)); else await db.insert(serviceAreas).values(values);
    return;
  }
  if (type === "services") {
    const values = { areaId: numberValue(rawData.areaId), title: stringValue(rawData.title), summary: nullableString(rawData.summary), deliverables: stringArray(rawData.deliverables), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(services).set(values).where(eq(services.id, id)); else await db.insert(services).values(values);
    return;
  }
  if (type === "projects") {
    const values = { slug: stringValue(rawData.slug), title: stringValue(rawData.title), subtitle: nullableString(rawData.subtitle), summary: nullableString(rawData.summary), description: nullableString(rawData.description), status: nullableString(rawData.status), startDate: nullableString(rawData.startDate), endDate: nullableString(rawData.endDate), tags: stringArray(rawData.tags), tools: stringArray(rawData.tools), outcomes: stringArray(rawData.outcomes), featured: boolValue(rawData.featured), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(projects).set(values).where(eq(projects.id, id)); else await db.insert(projects).values(values);
    return;
  }
  if (type === "media") {
    const values = { projectId: numberValue(rawData.projectId), url: stringValue(rawData.url), storageKey: nullableString(rawData.storageKey), alt: nullableString(rawData.alt), sortOrder: numberValue(rawData.sortOrder) };
    if (id) await db.update(projectMedia).set(values).where(eq(projectMedia.id, id)); else await db.insert(projectMedia).values(values);
    return;
  }
  throw new Error("Unknown content type");
}

export async function deleteContent(type: string, id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  if (type === "education") return db.delete(education).where(eq(education.id, id));
  if (type === "publications") return db.delete(publications).where(eq(publications.id, id));
  if (type === "experiences") return db.delete(experiences).where(eq(experiences.id, id));
  if (type === "skills") return db.delete(skills).where(eq(skills.id, id));
  if (type === "icons") return db.delete(sectionIcons).where(eq(sectionIcons.id, id));
  if (type === "serviceAreas") return db.delete(serviceAreas).where(eq(serviceAreas.id, id));
  if (type === "services") return db.delete(services).where(eq(services.id, id));
  if (type === "projects") return db.delete(projects).where(eq(projects.id, id));
  if (type === "media") return db.delete(projectMedia).where(eq(projectMedia.id, id));
  throw new Error("This content type cannot be deleted");
}

export async function addProjectMedia(values: { projectId: number; url: string; storageKey?: string | null; alt?: string | null; sortOrder?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await db.insert(projectMedia).values({ ...values, storageKey: values.storageKey ?? null, alt: values.alt ?? null, sortOrder: values.sortOrder ?? 0 });
}

export async function updateProfilePhoto(photoUrl: string, photoKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  await ensurePortfolioSeed();
  await db.update(profiles).set({ photoUrl, photoKey }).where(eq(profiles.id, 1));
}
