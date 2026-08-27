"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import type { PortfolioSnapshot } from "@/lib/portfolio";
import { getLivePortfolioSnapshot } from "@/lib/portfolioBrowser";

function ArchiveProjectCard({ project }: { project: Record<string, any> }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const mediaAlt = project.project_media?.[0]?.alt ?? project.title;

  return <Link className="project-card archive-card" href={`/projects/${project.slug}`}>
    <div className="project-card-media archive-card-media">
      {project.imageUrl && !imageUnavailable ? <img src={project.imageUrl} alt={mediaAlt} loading="lazy" decoding="async" onError={() => setImageUnavailable(true)} /> : <div className="archive-card-fallback" aria-label="Project documentation visual unavailable"><span>Engineering case study</span></div>}
      <span className="project-card-cta">View case study <b aria-hidden="true">→</b></span>
    </div>
    <div className="archive-card-content">
      <span>{project.status}</span>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="tag-row">{(project.tags ?? []).slice(0, 4).map((tag: string) => <em key={tag}>{tag}</em>)}</div>
    </div>
  </Link>;
}

export function ProjectsArchiveContent({ initialPortfolio }: { initialPortfolio: PortfolioSnapshot }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  useEffect(() => { getLivePortfolioSnapshot().then(setPortfolio).catch(() => undefined); }, []);
  const name = portfolio.profile?.name ?? "Mohammed Bajhaw";
  return <><SiteHeader name={name} /><main className="content-page"><section className="page-intro"><div className="shell"><p className="eyebrow">Project archive</p><h1>Projects built across <span>robotics, autonomy, and control.</span></h1><p>A complete archive of research and engineering work, with methods, tools, and documented outcomes.</p></div></section><section className="section"><div className="shell"><div className="project-grid archive-grid">{portfolio.projects.map((project) => <ArchiveProjectCard project={project} key={project.id} />)}</div></div></section></main></>;
}
