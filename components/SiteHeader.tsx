import Link from "next/link";

export function SiteHeader({ name = "Mohammed Bajhaw" }: { name?: string }) {
  return <header className="site-header"><div className="shell header-inner"><Link className="wordmark" href="/">{name}</Link><nav aria-label="Primary navigation"><Link href="/">Home</Link><Link href="/projects">Projects</Link><Link href="/services">Services</Link></nav></div></header>;
}
