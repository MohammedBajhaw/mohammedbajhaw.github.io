import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SkillGroupIcon } from "@/components/SkillIcon";
import { getPortfolioSnapshot } from "@/lib/portfolio";

function SectionMotif({ icons, sectionKey, variant = "standard" }: { icons: Record<string, any>[]; sectionKey: string; variant?: "standard" | "hero" }) {
  const matchingIcons = icons.filter((icon) => icon.section_key === sectionKey && icon.imageUrl).slice(0, 2);

  return <div className={`section-motif section-motif-${variant}`} aria-hidden="true">
    <span className="tech-orbit tech-orbit-one" />
    <span className="tech-orbit tech-orbit-two" />
    <span className="tech-trace tech-trace-one" />
    <span className="tech-trace tech-trace-two" />
    {matchingIcons.map((icon, index) => <img className={`motif-asset motif-asset-${index + 1}`} src={icon.imageUrl} alt="" key={icon.id} />)}
  </div>;
}

export default async function HomePage() {
  const portfolio = await getPortfolioSnapshot();
  const profile = portfolio.profile;
  const name = profile?.name ?? "Mohammed Bajhaw";
  const heroPortrait = profile?.photo_url ?? "/manus-storage/mohammed-bajhaw-hero-portrait-placeholder_d40c3786.jpg";
  const cvUrl = "/manus-storage/Mohammed_Bajhaw_CV_e4b21ef0.pdf";
  const skillGroups = portfolio.skills.reduce<Record<string, Record<string, any>[]>>((groups, skill) => {
    const category = skill.category || "Technical practice";
    groups[category] = [...(groups[category] ?? []), skill];
    return groups;
  }, {});

  if (!portfolio.configured) {
    return <main className="migration-shell"><p className="eyebrow">Next.js + Supabase migration</p><h1>Connecting the new portfolio architecture.</h1><p>Supabase environment variables are the final configuration required before the public content can load.</p></main>;
  }

  return <><SiteHeader name={name} /><main>
    <section className="hero section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="projects" variant="hero" /><div className="shell hero-grid"><div><p className="eyebrow">Academic &amp; Professional Portfolio</p><h1>Engineering <span>autonomous systems</span> that work in the real world.</h1><p className="hero-copy">{profile?.bio ?? "A portfolio for robotics, embedded systems, and autonomous engineering."}</p><div className="actions"><Link className="button primary" href="/projects">Explore projects</Link><Link className="button" href="/services">View engineering services</Link><a className="button button-cv" href={cvUrl} download>Download CV <span aria-hidden="true">↓</span></a>{profile?.email && <a className="button" href={`mailto:${profile.email}`}>Contact me</a>}</div><div className="contact-links">{profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}{profile?.phone && <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>}</div></div><aside className="hero-aside"><figure className="hero-portrait"><img src={heroPortrait} alt={`${name}, ${profile?.professional_title ?? "Mechatronics Engineer"}`} /><figcaption><span>Mohammed Bajhaw</span><small>MECHATRONICS ENGINEERING</small></figcaption></figure><div className="hero-note"><p>FIELD / AUTONOMY</p><strong>{profile?.professional_title ?? "Mechatronics Engineering"}</strong><p>ROS · AI · CONTROL</p></div></aside></div></section>
    <section className="section"><div className="shell"><p className="index">01 / EDUCATION</p><h2>Academic foundation</h2><div className="timeline">{portfolio.education.map((item) => <article key={item.id}><span>{item.start_year} — {item.end_year}</span><h3>{item.degree}{item.field ? ` in ${item.field}` : ""}</h3><p>{item.institution}{item.location ? ` · ${item.location}` : ""}</p></article>)}</div></div></section>
    <section className="section muted section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="publications" /><div className="shell"><p className="index">02 / PUBLICATIONS</p><h2>Research &amp; publications</h2><div className="card-grid">{portfolio.publications.map((item) => <article className="card" key={item.id}><span>{item.venue}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/publications/${item.id}`}>Read publication</Link></article>)}</div></div></section>
    <section className="section section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="experiences" /><div className="shell"><p className="index">03 / EXPERIENCE</p><h2>Research experience</h2><div className="timeline">{portfolio.experiences.map((item) => <article key={item.id}><span>{item.start_date} — {item.end_date}</span><h3>{item.role}</h3><p>{item.organization}</p><p>{item.summary}</p></article>)}</div></div></section>
    <section className="section muted section-with-motif skill-section"><SectionMotif icons={portfolio.sectionIcons} sectionKey="skills" /><div className="shell"><div className="skills-heading"><div><p className="index">04 / TECHNICAL CAPABILITIES</p><h2>Skills, organised by system layer.</h2></div><p>{portfolio.skills.length} tools and methods across {Object.keys(skillGroups).length} engineering disciplines.</p></div><div className="skill-groups">{Object.entries(skillGroups).map(([category, skills], index) => <article className="skill-group" key={category}><div className="skill-group-heading"><SkillGroupIcon category={category} /><div><span className="skill-group-index">0{index + 1}</span><h3>{category}</h3></div><em>{skills.length} skills</em></div><div className="skill-tags">{skills.map((item) => <span className="skill-tag" key={item.id}>{item.label}</span>)}</div></article>)}</div></div></section>
    <section className="section section-with-motif"><SectionMotif icons={portfolio.sectionIcons} sectionKey="projects" /><div className="shell"><div className="section-title-row"><div><p className="index">05 / PROJECT ARCHIVE</p><h2>Selected work, fully documented.</h2></div><Link className="button" href="/projects">View all projects</Link></div><div className="project-grid">{portfolio.projects.slice(0, 6).map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}><div className="project-card-media">{project.imageUrl && <img src={project.imageUrl} alt={project.project_media?.[0]?.alt ?? project.title} />}<span className="project-card-cta">View case study <b aria-hidden="true">→</b></span></div><div><span>{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p></div></Link>)}</div></div></section>
  </main><footer className="site-footer"><div className="shell footer-grid"><div><p className="eyebrow">LET&apos;S CONNECT</p><h2>Building dependable systems starts with a clear engineering conversation.</h2><p className="footer-copy">Open to research collaboration, technical consulting, and carefully scoped autonomous-systems projects.</p></div><div className="footer-links"><a className="button primary" href={profile?.email ? `mailto:${profile.email}` : "mailto:mohammedbajhaw2020@gmail.com"}>Contact me <span aria-hidden="true">↗</span></a><a className="footer-link" href={cvUrl} download>Download CV <span aria-hidden="true">↓</span></a>{profile?.linkedin_url && <a className="footer-link" href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>}{profile?.phone && <a className="footer-link" href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>}</div><p className="footer-meta">© {new Date().getFullYear()} {name}<span>·</span>Mechatronics Engineering</p></div></footer></>;
}
