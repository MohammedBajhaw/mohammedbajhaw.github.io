import { readFile, writeFile } from "node:fs/promises";

const exportData = JSON.parse(await readFile("/tmp/portfolio-current-export.json", "utf8"));
const quote = (value) => value === null || value === undefined ? "null" : `'${String(value).replaceAll("'", "''")}'`;
const array = (value) => `array[${(Array.isArray(value) ? value : []).map(quote).join(", ")}]`;
const statements = ["begin;"];

for (const skill of exportData.skills) {
  statements.push(`insert into public.skills (label, category, icon, sort_order) values (${quote(skill.label)}, ${quote(skill.category)}, ${quote(skill.icon)}, ${Number(skill.sortOrder)});`);
}

for (const icon of exportData.sectionIcons.filter((item) => !item.label.startsWith("section-icon-test-"))) {
  statements.push(`insert into public.section_icons (section_key, label, storage_path, alt, sort_order) values (${quote(icon.sectionKey)}, ${quote(icon.label)}, ${quote(icon.url)}, ${quote(icon.alt)}, ${Number(icon.sortOrder)});`);
}

for (const project of exportData.projects) {
  statements.push(`insert into public.projects (slug, title, subtitle, summary, description, status, start_date, end_date, tags, tools, outcomes, featured, sort_order) values (${quote(project.slug)}, ${quote(project.title)}, ${quote(project.subtitle)}, ${quote(project.summary)}, ${quote(project.description)}, ${quote(project.status)}, ${quote(project.startDate)}, ${quote(project.endDate)}, ${array(project.tags)}, ${array(project.tools)}, ${array(project.outcomes)}, ${project.featured ? "true" : "false"}, ${Number(project.sortOrder)});`);
}

const projectsById = new Map(exportData.projects.map((project) => [project.id, project]));
for (const media of exportData.projectMedia) {
  const project = projectsById.get(media.projectId);
  if (!project) continue;
  statements.push(`insert into public.project_media (project_id, storage_path, alt, sort_order) values ((select id from public.projects where slug = ${quote(project.slug)}), ${quote(media.url)}, ${quote(media.alt)}, ${Number(media.sortOrder)});`);
}

statements.push("commit;");
await writeFile("/home/ubuntu/engineering-portfolio/supabase/seeds/20260820_portfolio_remainder_input.json", JSON.stringify({ project_id: "ntynaiuxqylscazugcdo", query: statements.join("\n") }) + "\n", "utf8");
console.log(`Prepared ${statements.length - 2} insert statements for Supabase.`);
