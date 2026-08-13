import { ArrowDownLeft, ArrowUpLeft, AtSign, BookOpen, BriefcaseBusiness, ExternalLink, GraduationCap, MapPin, Settings, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const navItems = [
  ["About", "#about"], ["Education", "#education"], ["Publications", "#publications"], ["Experience", "#experience"], ["Skills", "#skills"], ["Projects", "#projects"],
];

function iconFor(name: string | null) {
  const map: Record<string, React.ReactNode> = {
    Radar: <Sparkles size={17} />, ScanLine: <Sparkles size={17} />, Cpu: <Sparkles size={17} />, CircuitBoard: <Sparkles size={17} />, Eye: <Sparkles size={17} />, ChartNoAxesCombined: <Sparkles size={17} />, Box: <Sparkles size={17} />, Code2: <Sparkles size={17} />,
  };
  return map[name ?? ""] ?? <Sparkles size={17} />;
}

export default function Home() {
  const { data, isLoading, error } = trpc.portfolio.public.useQuery();
  if (isLoading) return <div className="page-loading">LOADING PORTFOLIO</div>;
  if (error || !data?.profile) return <div className="page-loading">تعذر تحميل محتوى الموقع</div>;
  const profile = data.profile;
  const featured = data.projects.filter((project) => project.featured).slice(0, 3);

  return (
    <div className="site-shell" dir="rtl">
      <header className="site-header">
        <div className="shell header-inner">
          <a className="wordmark" href="#about"><span className="wordmark-mark">MB</span><span>{profile.name}</span></a>
          <nav className="site-nav" aria-label="أقسام الموقع">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
            <Link className="nav-admin" href="/admin"><Settings size={13} /> إدارة</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="about">
          <div className="shell hero-grid">
            <div>
              <p className="eyebrow">Academic & Professional Portfolio</p>
              <h1>هندسة الميكاترونكس <span>للأنظمة الذاتية</span> والروبوتات.</h1>
              <p className="hero-copy">{profile.bio}</p>
              <div className="hero-actions">
                <a className="button-primary" href="#projects">استكشف المشاريع <ArrowDownLeft size={16} /></a>
                <a className="button-secondary" href={`mailto:${profile.email}`}><AtSign size={16} /> تواصل معي</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="portrait-frame">
                {profile.photoUrl ? <img src={profile.photoUrl} alt={profile.name} /> : <div className="portrait-placeholder"><span className="initials">MB</span><span className="portrait-note">PROFILE PHOTO · ADD FROM ADMIN</span></div>}
              </div>
              <div className="coordinate-card"><p>FIELD / AUTONOMY</p><strong>{profile.professionalTitle}</strong><p>01 · 2026</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="education">
          <div className="shell">
            <div className="section-head"><p className="section-index">01 / EDUCATION</p><div><h2 className="section-heading">التعليم الأكاديمي</h2><p className="section-description">أساس هندسي يجمع التصميم الميكانيكي والإلكترونيات والتحكم والبرمجة ضمن سياق الروبوتات والأنظمة الذكية.</p></div></div>
            {data.education.map((item) => <article className="education-card" key={item.id}><div><span className="meta">{item.startYear} — {item.endYear}</span><h3>{item.degree} in {item.field}</h3><p className="experience-org">{item.institution} · {item.location}</p></div><p className="education-detail">{item.description}</p></article>)}
          </div>
        </section>

        <section className="section" id="publications">
          <div className="shell">
            <div className="section-head"><p className="section-index">02 / PUBLICATIONS</p><div><h2 className="section-heading">المنشورات والأبحاث</h2><p className="section-description">أبحاث مركزة على رسم الخرائط ثلاثية الأبعاد والتموضع الذاتي للطائرات المسيّرة في البيئات المحرومة من إشارات GPS.</p></div></div>
            <div className="publication-grid">{data.publications.map((item) => <article className="publication-card" key={item.id}><span className="meta">{item.venue}</span><h3>{item.title}</h3><p>{item.summary}</p><span className="status-chip">{item.status} · {item.publicationDate}</span></article>)}</div>
          </div>
        </section>

        <section className="section" id="experience">
          <div className="shell">
            <div className="section-head"><p className="section-index">03 / EXPERIENCE</p><div><h2 className="section-heading">الخبرة البحثية</h2><p className="section-description">تجربة عملية بين البحث العلمي واختبارات المنصات الروبوتية وتكامل الاستشعار والحوسبة الطرفية.</p></div></div>
            <div className="experience-list">{data.experiences.map((item) => <article className="experience-item" key={item.id}><div><span className="meta">{item.startDate} — {item.endDate}</span><p className="experience-org">{item.organization}</p></div><div><h3 className="experience-role">{item.role}</h3><p className="experience-summary">{item.summary}</p><ul className="highlight-list">{item.highlights.map((highlight, index) => <li key={index}>{highlight}</li>)}</ul></div></article>)}</div>
          </div>
        </section>

        <section className="section" id="skills">
          <div className="shell">
            <div className="section-head"><p className="section-index">04 / SKILLS</p><div><h2 className="section-heading">الأدوات والتقنيات</h2><p className="section-description">مجموعة أدوات عملية من البحث والـ autonomy إلى التصميم والأنظمة المضمنة والرؤية الحاسوبية.</p></div></div>
            <div className="skill-grid">{data.skills.map((skill) => <div className="skill-cell" key={skill.id}><div className="skill-icon">{iconFor(skill.icon)}</div><div><strong>{skill.label}</strong><span>{skill.category}</span></div></div>)}</div>
          </div>
        </section>

        <section className="section" id="projects">
          <div className="shell">
            <div className="project-intro"><div><p className="section-index">05 / SELECTED PROJECTS</p><h2 className="section-heading">المشاريع المختارة</h2></div><p>المشاريع هي قلب هذا البورتفوليو: من منصات الطيران الذاتية إلى روبوتات الإنقاذ والتحكم الميكاترونيكي.</p></div>
            <div className="project-grid">{featured.map((project) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.id}><span className="project-arrow"><ArrowUpLeft size={19} /></span>{project.media[0] ? <img className="project-image" src={project.media[0].url} alt={project.media[0].alt ?? project.title} /> : <div className="project-image-fallback" />}<div className="project-body"><span className="meta">{project.status}</span><h3>{project.title}</h3><p>{project.summary}</p><div className="tag-list">{project.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div></Link>)}</div>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="shell footer-inner"><span>© {new Date().getFullYear()} {profile.name}</span><a className="footer-contact" href={`mailto:${profile.email}`}>{profile.email} <ArrowUpLeft size={13} /></a></div></footer>
    </div>
  );
}
