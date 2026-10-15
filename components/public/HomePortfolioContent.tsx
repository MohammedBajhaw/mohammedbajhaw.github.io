"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Linkedin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillGroupIcon } from "@/components/SkillIcon";
import type { PortfolioSnapshot } from "@/lib/portfolio";
import { getLivePortfolioSnapshot } from "@/lib/portfolioBrowser";

function SectionMotif({ icons, sectionKey, variant = "standard" }: { icons: Record<string, any>[]; sectionKey: string; variant?: "standard" | "hero" }) {
  const matchingIcons = icons.filter((icon) => icon.section_key === sectionKey && icon.imageUrl).slice(0, 2);
  return <div className={`section-motif section-motif-${variant}`} aria-hidden="true"><span className="tech-orbit tech-orbit-one" /><span className="tech-orbit tech-orbit-two" /><span className="tech-trace tech-trace-one" /><span className="tech-trace tech-trace-two" />{matchingIcons.map((icon, index) => <img className={`motif-asset motif-asset-${index + 1}`} src={icon.imageUrl} alt="" key={icon.id} />)}</div>;
}

function formatPhone(phone: string) {
  return phone.replace(/^(\+\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
}

function useCountUp(target: number, start: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const duration = 900;
    const startTime = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);
  return value;
}

function HeroStat({ label, target, start }: { label: string; target: number; start: boolean }) {
  const value = useCountUp(target, start);
  return <div className="hero-stat"><strong>{value}</strong><span>{label}</span></div>;
}

function HeroStats({ stats }: { stats: { label: string; value: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div className="hero-stats" ref={ref}>{stats.map((stat) => <HeroStat key={stat.label} label={stat.label} target={stat.value} start={visible} />)}</div>;
}

export function HomePortfolioContent({ initialPortfolio }: { initialPortfolio: PortfolioSnapshot }) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);

  useEffect(() => {
    getLivePortfolioSnapshot().then(setPortfolio).catch(() => undefined);
  }, []);

  const profile = portfolio.profile;
  const name = profile?.name ?? "Mohammed Bajhaw";
  const hasManagedPortrait = Boolean(profile?.photo_path);
  const temporaryPortraitUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85";
  const heroPortrait = profile?.photo_path ?? temporaryPortraitUrl;
  const cvUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/managed-project-media?path=${encodeURIComponent("/manus-storage/Mohammed_Bajhaw_CV_e4b21ef0.pdf")}`;
  const skillGroups = portfolio.skills.reduce<Record<string, Record<string, any>[]>>((groups, skill) => {
    const category = skill.category || "Technical practice";
    groups[category] = [...(groups[category] ?? []), skill];
    return groups;
  }, {});

  if (!portfolio.configured) return <main className="migration-shell"><p className="eyebrow">Next.js + Supabase migration</p><h1>Connecting the new portfolio architecture.</h1><p>Supabase environment variables are the final configuration required before the public content can load.</p></main>;

  return <><SiteHeader name={name} /><main>
    <section className="hero section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="projects" variant="hero" /><div className="shell hero-grid"><div><p className="eyebrow">Academic &amp; Professional Portfolio</p><h1>I build <span>autonomous robots</span> and the embedded systems behind them.</h1><p className="hero-copy">{profile?.bio ?? "A portfolio for robotics, embedded systems, and autonomous engineering."}</p><div className="actions"><Link className="button primary" href="/projects">Explore projects</Link><Link className="button" href="/services">View engineering services</Link><a className="button button-cv" href={cvUrl} download>Download CV <span aria-hidden="true">↓</span></a>{profile?.email && <a className="button" href={`mailto:${profile.email}`}>Contact me</a>}</div><div className="contact-links">{profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={18} aria-hidden="true" />LinkedIn</a>}{profile?.phone && <a href={`tel:${profile.phone.replace(/\s/g, "")}`}><Phone size={18} aria-hidden="true" />{formatPhone(profile.phone)}</a>}</div><HeroStats stats={[{ label: "Projects", value: portfolio.projects.length }, { label: "Publications", value: portfolio.publications.length }, { label: "Skills", value: portfolio.skills.length }]} /></div><aside className="hero-aside"><figure className="hero-portrait"><img src={heroPortrait} referrerPolicy="no-referrer" alt={hasManagedPortrait ? `${name}, ${profile?.professional_title ?? "Mechatronics Engineer"}` : "Temporary editorial portrait for an engineering portfolio"} /><figcaption><span>{hasManagedPortrait ? name : "Engineering portfolio"}</span><small>{hasManagedPortrait ? "MECHATRONICS ENGINEERING" : "TEMPORARY VISUAL"}</small></figcaption></figure><div className="hero-note"><p>FIELD / AUTONOMY</p><strong>{profile?.professional_title ?? "Mechatronics Engineering"}</strong><p>ROS · AI · CONTROL</p></div></aside></div></section>
    <section className="section"><div className="shell"><p className="index">01 / EDUCATION</p><h2>Academic foundation</h2><div className="timeline">{portfolio.education.map((item) => <article key={item.id}><span className="timeline-node" aria-hidden="true" /><span>{item.start_year} — {item.end_year}</span><h3>{item.degree}{item.field ? ` in ${item.field}` : ""}</h3><p>{item.institution}{item.location ? ` · ${item.location}` : ""}</p></article>)}</div></div></section>
    <section className="section muted section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="publications" /><div className="shell"><p className="index">02 / PUBLICATIONS</p><h2>Research &amp; publications</h2><div className="card-grid">{portfolio.publications.map((item) => <article className="card" key={item.id}><span>{item.venue}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/publications/${item.id}`}>Read publication</Link></article>)}</div></div></section>
    <section className="section section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="experiences" /><div className="shell"><p className="index">03 / EXPERIENCE</p><h2>Work experience</h2><div className="timeline">{portfolio.experiences.map((item) => <article key={item.id}><span className="timeline-node" aria-hidden="true" /><span>{item.start_date} — {item.end_date}</span><h3>{item.role}</h3><p>{item.organization}</p><p>{item.summary}</p></article>)}</div></div></section>
    <section className="section muted section-with-motif skill-section"><SectionMotif icons={portfolio.sectionIcons} sectionKey="skills" /><div className="shell"><div className="skills-heading"><div><p className="index">04 / TECHNICAL CAPABILITIES</p><h2>Skills, organised by system layer.</h2></div><p>{portfolio.skills.length} tools and methods across {Object.keys(skillGroups).length} engineering disciplines.</p></div><div className="skill-groups">{Object.entries(skillGroups).map(([category, skills], index) => <article className="skill-group" key={category}><div className="skill-group-heading"><SkillGroupIcon category={category} /><div><span className="skill-group-index">0{index + 1}</span><h3>{category}</h3></div><em>{skills.length} skills</em></div><div className="skill-tags">{skills.map((item) => <span className="skill-tag" key={item.id}>{item.label}</span>)}</div></article>)}</div></div></section>
    <section className="section section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="projects" /><div className="shell"><div className="section-title-row"><div><p className="index">05 / PROJECT ARCHIVE</p><h2>Selected work, fully documented.</h2></div><Link className="button" href="/projects">View all projects</Link></div><div className="project-grid">{portfolio.projects.slice(0, 6).map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}><div className="project-card-media">{project.imageUrl && <img src={project.imageUrl} alt={project.project_media?.[0]?.alt ?? project.title} />}<span className="project-card-cta">View case study <b aria-hidden="true">→</b></span></div><div><span>{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p>{project.outcomes?.[0] && <p className="project-outcome">{project.outcomes[0]}</p>}</div></Link>)}</div></div></section>
  </main><footer className="site-footer"><div className="shell footer-grid"><div><p className="eyebrow">LET&apos;S CONNECT</p><h2>Building dependable systems starts with a clear engineering conversation.</h2><p className="footer-copy">Open to research collaboration, technical consulting, and carefully scoped autonomous-systems projects.</p></div><div className="footer-links"><a className="button primary" href={profile?.email ? `mailto:${profile.email}` : "mailto:mohammedbajhaw2020@gmail.com"}>Contact me <span aria-hidden="true">↗</span></a><a className="footer-link" href={cvUrl} download>Download CV <span aria-hidden="true">↓</span></a>{profile?.linkedin_url && <a className="footer-link" href={profile.linkedin_url} target="_blank" rel="noreferrer"><span className="footer-link-label"><Linkedin size={17} aria-hidden="true" />LinkedIn</span><span aria-hidden="true">↗</span></a>}{profile?.phone && <a className="footer-link" href={`tel:${profile.phone.replace(/\s/g, "")}`}><span className="footer-link-label"><Phone size={17} aria-hidden="true" />{formatPhone(profile.phone)}</span></a>}</div><p className="footer-meta">© {new Date().getFullYear()} {name}<span>·</span>Mechatronics Engineering</p></div></footer></>;
}
