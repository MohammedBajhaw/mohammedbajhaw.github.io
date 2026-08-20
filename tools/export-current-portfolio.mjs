import mysql from "mysql2/promise";
import { writeFile } from "node:fs/promises";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for the read-only content export.");

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const queries = {
  profile: "SELECT id, name, professionalTitle, location, email, linkedinUrl, phone, bio, photoUrl, photoKey FROM profiles LIMIT 1",
  education: "SELECT id, institution, degree, field, location, startYear, endYear, description, sortOrder FROM education ORDER BY sortOrder ASC",
  publications: "SELECT id, title, venue, publicationDate, status, authors, summary, details, keywords, url, sortOrder FROM publications ORDER BY sortOrder ASC",
  experiences: "SELECT id, role, organization, location, startDate, endDate, isCurrent, summary, highlights, sortOrder FROM experiences ORDER BY sortOrder ASC",
  skills: "SELECT id, label, category, icon, sortOrder FROM skills ORDER BY category ASC, sortOrder ASC",
  sectionIcons: "SELECT id, sectionKey, label, url, storageKey, alt, sortOrder FROM section_icons ORDER BY sortOrder ASC",
  serviceAreas: "SELECT id, title, description, accent, icon, sortOrder FROM service_areas ORDER BY sortOrder ASC",
  services: "SELECT id, areaId, title, summary, deliverables, sortOrder FROM services ORDER BY areaId ASC, sortOrder ASC",
  projects: "SELECT id, slug, title, subtitle, summary, description, status, startDate, endDate, tags, tools, outcomes, featured, sortOrder FROM projects ORDER BY sortOrder ASC",
  projectMedia: "SELECT id, projectId, url, storageKey, alt, sortOrder FROM project_media ORDER BY projectId ASC, sortOrder ASC",
};

const exported = {};
for (const [key, query] of Object.entries(queries)) {
  const [rows] = await connection.query(query);
  exported[key] = rows;
}

await connection.end();
await writeFile("/tmp/portfolio-current-export.json", `${JSON.stringify(exported, null, 2)}\n`, "utf8");
console.log("Read-only portfolio export written to /tmp/portfolio-current-export.json");
