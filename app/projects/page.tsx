import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export default async function ProjectsPage() {
  const portfolio = await getPortfolioSnapshot();
  const name = portfolio.profile?.name ?? "Mohammed Bajhaw";
  return <><SiteHeader name={name} /><main className="content-page"><section className="page-intro"><div className="shell"><p className="eyebrow">Project archive</p><h1>Projects built across <span>robotics, autonomy, and control.</span></h1><p>A complete archive of research and engineering work, with methods, tools, and documented outcomes.</p></div></section><section className="section"><div className="shell"><div className="project-grid archive-grid">{portfolio.projects.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}>{project.imageUrl && <img src={project.imageUrl} alt={project.project_media?.[0]?.alt ?? project.title} />}<div><span>{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="tag-row">{(project.tags ?? []).slice(0, 4).map((tag: string) => <em key={tag}>{tag}</em>)}</div></div></Link>)}</div></div></section></main></>;
}
