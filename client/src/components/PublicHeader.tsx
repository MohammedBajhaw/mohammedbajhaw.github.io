import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
];

export default function PublicHeader({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return <header className="site-header">
    <div className="shell header-inner">
      <Link className="wordmark" href="/" onClick={closeMenu}>{name}</Link>
      <button className="nav-mobile-toggle" type="button" aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen} aria-controls="primary-navigation" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? <X size={19} /> : <Menu size={20} />}
      </button>
      <nav id="primary-navigation" className={`site-nav ${isOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        {navItems.map((item) => <Link key={item.href} className={item.label === "Services" ? "nav-services" : ""} href={item.href} onClick={closeMenu}>{item.label}</Link>)}
      </nav>
    </div>
  </header>;
}
