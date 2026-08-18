import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import { trpc } from "@/lib/trpc";

export default function Projects() {
  const { data, isLoading, error } = trpc.portfolio.public.useQuery();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (isLoading) return <div className="page-loading">LOADING PROJECT ARCHIVE</div>;
  if (error || !data?.profile) return <div className="page-loading">Unable to load project archive.</div>;

  const { profile, projects } = data;
  return <div className="site-shell site-english projects-page">
    <PublicHeader name={profile.name} />
    <main>
      <section className="projects-archive-hero">
        <div className="shell">
          <p className="eyebrow">PROJECT ARCHIVE · {String(projects.length).padStart(2, "0")} CASE STUDIES</p>
          <h1>Engineering work,<br /><span>fully documented.</span></h1>
          <p>Explore research platforms, robotic systems, simulations, and prototypes through concise technical case studies with context, system stack, outcomes, and media.</p>
        </div>
      </section>
      <section className="projects-archive-list">
        <div className="shell">
          <div className="projects-archive-grid">
            {projects.map((project, index) => <Link className="project-card project-card--archive" href={`/projects/${project.slug}`} key={project.id}>
              <span className="project-number">{String(index + 1).padStart(2, "0")}</span><span className="project-arrow"><ArrowUpRight size={19} /></span>
              {project.media[0] ? <img className="project-image" src={project.media[0].url} alt={project.media[0].alt ?? project.title} /> : <div className="project-image-fallback" />}
              <div className="project-body"><span className="meta">{project.status}</span><h2>{project.title}</h2><p>{project.summary}</p><div className="tag-list">{project.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
            </Link>)}
          </div>
          <Link className="projects-back-link" href="/"><ArrowLeft size={16} /> Back to portfolio</Link>
        </div>
      </section>
    </main>
    <footer className="footer"><div className="shell footer-inner"><span>© {new Date().getFullYear()} {profile.name}</span><a className="footer-contact" href={`mailto:${profile.email}`}>{profile.email} <ArrowUpRight size={13} /></a></div></footer>
  </div>;
}
