"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import type { PortfolioSnapshot } from "@/lib/portfolio";
import { getLivePortfolioSnapshot } from "@/lib/portfolioBrowser";

export function ServicesContent({ initialPortfolio }: { initialPortfolio: PortfolioSnapshot }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  useEffect(() => { getLivePortfolioSnapshot().then(setPortfolio).catch(() => undefined); }, []);
  const name = portfolio.profile?.name ?? "Mohammed Bajhaw";
  return <><SiteHeader name={name} /><main className="content-page"><section className="page-intro services-intro"><div className="shell"><p className="eyebrow">Engineering services</p><h1>Technical support from <span>simulation to system integration.</span></h1><p>Defined scopes for robotics, embedded platforms, intelligent perception, and engineering review. Get in touch to discuss an appropriate deliverable.</p>{portfolio.profile?.email && <Link className="button primary" href={`mailto:${portfolio.profile.email}`}>Discuss a project</Link>}</div></section><section className="section"><div className="shell service-list">{portfolio.serviceAreas.map((area) => <article className="service-area" key={area.id}><header><p className="index">{String(area.sort_order).padStart(2, "0")} / {area.icon}</p><h2>{area.title}</h2><p>{area.description}</p></header><div className="service-cards">{[...(area.services ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((service) => <section key={service.id}><h3>{service.title}</h3><p>{service.summary}</p><div className="deliverables">{(service.deliverables ?? []).map((item: string) => <span key={item}>{item}</span>)}</div></section>)}</div></article>)}</div></section></main></>;
}
