import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { getPortfolioSnapshot } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const portfolio = await getPortfolioSnapshot();
  const profile = portfolio.profile;
  const name = profile?.name ?? "Mohammed Bajhaw";

  if (!portfolio.configured) {
    return <main className="migration-shell"><p className="eyebrow">Next.js + Supabase migration</p><h1>Connecting the new portfolio architecture.</h1><p>Supabase environment variables are the final configuration required before the public content can load.</p></main>;
  }

  return <><SiteHeader name={name} /><main>
    <section className="hero"><div className="shell hero-grid"><div><p className="eyebrow">Academic &amp; Professional Portfolio</p><h1>Engineering <span>autonomous systems</span> that work in the real world.</h1><p className="hero-copy">{profile?.bio ?? "A portfolio for robotics, embedded systems, and autonomous engineering."}</p><div className="actions"><Link className="button primary" href="/projects">Explore projects</Link><Link className="button" href="/services">View engineering services</Link>{profile?.email && <a className="button" href={`mailto:${profile.email}`}>Contact me</a>}</div><div className="contact-links">{profile?.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}{profile?.phone && <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>{profile.phone}</a>}</div></div><aside className="hero-note"><p>FIELD / AUTONOMY</p><strong>{profile?.professional_title ?? "Mechatronics Engineering"}</strong><p>ROS · AI · CONTROL</p></aside></div></section>
    <section className="section"><div className="shell"><p className="index">01 / EDUCATION</p><h2>Academic foundation</h2><div className="timeline">{portfolio.education.map((item) => <article key={item.id}><span>{item.start_year} — {item.end_year}</span><h3>{item.degree}{item.field ? ` in ${item.field}` : ""}</h3><p>{item.institution}{item.location ? ` · ${item.location}` : ""}</p></article>)}</div></div></section>
    <section className="section muted"><div className="shell"><p className="index">02 / PUBLICATIONS</p><h2>Research &amp; publications</h2><div className="card-grid">{portfolio.publications.map((item) => <article className="card" key={item.id}><span>{item.venue}</span><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/publications/${item.id}`}>Read publication</Link></article>)}</div></div></section>
    <section className="section"><div className="shell"><p className="index">03 / EXPERIENCE</p><h2>Research experience</h2><div className="timeline">{portfolio.experiences.map((item) => <article key={item.id}><span>{item.start_date} — {item.end_date}</span><h3>{item.role}</h3><p>{item.organization}</p><p>{item.summary}</p></article>)}</div></div></section>
    <section className="section muted"><div className="shell"><p className="index">04 / TECHNICAL CAPABILITIES</p><h2>Skills, organised by system layer.</h2><div className="skill-grid">{portfolio.skills.map((item) => <span key={item.id}>{item.label}</span>)}</div></div></section>
    <section className="section"><div className="shell"><div className="section-title-row"><div><p className="index">05 / PROJECT ARCHIVE</p><h2>Selected work, fully documented.</h2></div><Link className="button" href="/projects">View all projects</Link></div><div className="project-grid">{portfolio.projects.slice(0, 6).map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}>{project.imageUrl && <img src={project.imageUrl} alt={project.project_media?.[0]?.alt ?? project.title} />}<div><span>{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p></div></Link>)}</div></div></section>
  </main><footer><div className="shell">© {new Date().getFullYear()} {name}</div></footer></>;
}
