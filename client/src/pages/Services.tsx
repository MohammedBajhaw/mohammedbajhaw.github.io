import { ArrowLeft, ArrowUpRight, Bot, BrainCircuit, Cpu, FileCheck2, Mail, Settings2, Wrench } from "lucide-react";
import { useEffect } from "react";
import { Link } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import { trpc } from "@/lib/trpc";
import { hasPublishedServices } from "@/data/servicesState";

type ManagedService = { id: number; title: string; summary: string | null; deliverables: string[]; sortOrder: number };
type ManagedServiceArea = { id: number; title: string; description: string | null; accent: string; icon: string; sortOrder: number; services: ManagedService[] };

const servicePageCopy = {
  eyebrow: "Engineering services · scoped for delivery",
  title: "From technical uncertainty to a documented engineering path.",
  intro: "Practical support for robotics, embedded systems, intelligent prototypes, and industrial control. Each engagement is built around a defined technical scope, agreed deliverables, and documentation that makes the work reproducible.",
  process: ["Share the objective", "Confirm scope & deliverables", "Build, test & document"],
};

const iconMap = {
  robotics: Bot,
  embedded: Cpu,
  mechanical: Wrench,
  consulting: FileCheck2,
  vision: BrainCircuit,
  control: Settings2,
} as const;

function ServiceGroupIcon({ group }: { group: ManagedServiceArea }) {
  const Icon = iconMap[group.icon as keyof typeof iconMap] ?? Bot;
  return <span className={`service-group-icon ${group.accent}`}><Icon aria-hidden="true" size={22} strokeWidth={1.65} /></span>;
}

export default function Services() {
  const { data, isLoading, error } = trpc.portfolio.public.useQuery();
  const name = data?.profile?.name ?? "Mohammed Bajhaw";
  const email = data?.profile?.email ?? "";
  const serviceAreas = (data?.serviceAreas ?? []) as ManagedServiceArea[];
  const hasServiceContent = hasPublishedServices(serviceAreas);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return <div className="site-shell site-english services-page">
    <PublicHeader name={name} />
    <main>
      <section className="services-hero"><div className="shell services-hero-grid"><div><p className="eyebrow">{servicePageCopy.eyebrow}</p><h1>{servicePageCopy.title}</h1><p className="services-hero-copy">{servicePageCopy.intro}</p><div className="services-process" aria-label="Service delivery process">{servicePageCopy.process.map((step, index) => <span key={step}><b>{`0${index + 1}`}</b>{step}</span>)}</div></div><aside className="services-brief-card"><span className="meta">STARTING A BRIEF</span><h2>Clear inputs create useful engineering outputs.</h2><p>Share the objective, available hardware or data, current constraints, and the result you need. Scope and deliverables are confirmed before work begins.</p><a href={email ? `mailto:${email}` : "#contact"}>Discuss a technical brief <ArrowUpRight size={15} /></a></aside></div></section>

      {hasServiceContent ? <><section className="services-index"><div className="shell"><p className="section-index">SERVICE INDEX / {String(serviceAreas.length).padStart(2, "0")} PRACTICE AREAS</p><div className="services-index-links">{serviceAreas.map((group, index) => <a key={group.id} href={`#service-${group.id}`}><span>{String(group.sortOrder || index + 1).padStart(2, "0")}</span>{group.title}</a>)}</div></div></section><section className="services-archive" id="services">{serviceAreas.map((group, index) => { const groupCode = String(group.sortOrder || index + 1).padStart(2, "0"); return <section className="service-group" id={`service-${group.id}`} key={group.id}><div className="shell"><div className="service-group-head"><div className="service-group-title"><ServiceGroupIcon group={group} /><p className="section-index">{groupCode} / PRACTICE AREA</p><h2>{group.title}</h2></div><p>{group.description}</p></div><div className="service-card-grid">{group.services.map((service, serviceIndex) => <article className="service-card" key={service.id}><div className="service-card-top"><span>{groupCode}.{String(service.sortOrder || serviceIndex + 1).padStart(2, "0")}</span><ArrowUpRight size={18} /></div><h3>{service.title}</h3><p>{service.summary}</p><div className="service-deliverables"><strong>Typical deliverables</strong>{service.deliverables.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></div></section>; })}</section></> : !isLoading && <section className="services-empty" id="services"><div className="shell"><p className="section-index">SERVICES CATALOGUE</p><h2>{error ? "The service catalogue is temporarily unavailable." : "Services are currently being curated."}</h2><p>{error ? "Please use the contact link below to discuss a technical brief directly." : "Please return to the portfolio or get in touch to discuss a robotics, embedded, or control-system brief."}</p><div><Link className="button-secondary" href="/"><ArrowLeft size={16} /> Back to portfolio</Link><a className="button-primary" href={email ? `mailto:${email}` : "#contact"}>Get in touch <Mail size={16} /></a></div></div></section>}

      <section className="services-contact" id="contact"><div className="shell services-contact-grid"><div><p className="eyebrow">Technical collaboration</p><h2>Have a robotics, embedded, or control-system brief?</h2></div><div><p>Start with the technical objective, the available hardware or data, and the result you need. The initial discussion is used to define a practical scope and deliverables.</p><a className="button-primary" href={email ? `mailto:${email}` : "#services"}>Start a conversation <Mail size={16} /></a><Link className="services-back" href="/"><ArrowLeft size={15} /> Back to portfolio</Link></div></div></section>
    </main>
    <footer className="footer"><div className="shell footer-inner"><span>© {new Date().getFullYear()} {name}</span><Link className="footer-contact" href="/">Portfolio home <ArrowUpRight size={13} /></Link></div></footer>
  </div>;
}
