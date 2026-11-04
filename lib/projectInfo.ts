// Facts shown in the info block at the top of a project page. The projects table has no columns for
// them, so they live here, keyed by slug. A project's date otherwise comes from its end_date column.
export type ProjectInfoRow = { label: string; value: string };

const PROJECT_INFO: Record<string, ProjectInfoRow[]> = {
  "offline-multi-sensor-ai-payload-for-usar": [
    { label: "Program", value: "TÜBİTAK 2209-A" },
    { label: "Role", value: "Project Lead & Sole Developer" },
    { label: "Supervisor", value: "Prof. Dr. Ayşegül Uçar" },
    { label: "Lab", value: "RAI Laboratory, Mechatronics Engineering Department, Fırat University" },
    { label: "Date", value: "02/2026 – 09/2026" },
    { label: "Status", value: "Research prototype – research paper under review" },
    { label: "Award", value: "🏆 3rd Place, Innovation Competition, 4th Invention and Innovation Conference (2026)" },
  ],
  "rko-lio-dji-uav-gps-denied-mapping": [
    { label: "Lab", value: "RAI Laboratory, Fırat University – TÜBİTAK 1001 project (UAV work package)" },
  ],
};

export function projectInfoRows(project: Record<string, any>): ProjectInfoRow[] {
  const rows = PROJECT_INFO[project.slug] ?? [];
  if (rows.some((row) => row.label === "Date") || !project.end_date) return rows;
  return [...rows, { label: "Date", value: String(project.end_date) }];
}
