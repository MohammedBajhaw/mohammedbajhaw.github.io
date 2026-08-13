import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  professionalTitle: varchar("professionalTitle", { length: 220 }).notNull(),
  location: varchar("location", { length: 220 }),
  email: varchar("email", { length: 320 }),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  bio: text("bio"),
  photoUrl: varchar("photoUrl", { length: 1000 }),
  photoKey: varchar("photoKey", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const education = mysqlTable("education", {
  id: int("id").autoincrement().primaryKey(),
  institution: varchar("institution", { length: 240 }).notNull(),
  degree: varchar("degree", { length: 240 }).notNull(),
  field: varchar("field", { length: 240 }),
  location: varchar("location", { length: 220 }),
  startYear: varchar("startYear", { length: 12 }),
  endYear: varchar("endYear", { length: 12 }),
  description: text("description"),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const publications = mysqlTable("publications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 700 }).notNull(),
  venue: varchar("venue", { length: 240 }),
  publicationDate: varchar("publicationDate", { length: 40 }),
  status: varchar("status", { length: 120 }),
  authors: text("authors"),
  summary: text("summary"),
  url: varchar("url", { length: 1000 }),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  role: varchar("role", { length: 240 }).notNull(),
  organization: varchar("organization", { length: 240 }).notNull(),
  location: varchar("location", { length: 220 }),
  startDate: varchar("startDate", { length: 40 }),
  endDate: varchar("endDate", { length: 40 }),
  isCurrent: boolean("isCurrent").default(false).notNull(),
  summary: text("summary"),
  highlights: json("highlights").$type<string[]>().notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 160 }).notNull(),
  category: varchar("category", { length: 160 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  sortOrder: int("sortOrder").default(0).notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 240 }).notNull().unique(),
  title: varchar("title", { length: 320 }).notNull(),
  subtitle: varchar("subtitle", { length: 400 }),
  summary: text("summary"),
  description: text("description"),
  status: varchar("status", { length: 120 }),
  startDate: varchar("startDate", { length: 40 }),
  endDate: varchar("endDate", { length: 40 }),
  tags: json("tags").$type<string[]>().notNull(),
  tools: json("tools").$type<string[]>().notNull(),
  outcomes: json("outcomes").$type<string[]>().notNull(),
  featured: boolean("featured").default(false).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectMedia = mysqlTable("project_media", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 1200 }).notNull(),
  storageKey: varchar("storageKey", { length: 1200 }),
  alt: varchar("alt", { length: 320 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
