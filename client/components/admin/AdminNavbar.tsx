"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, ExternalLink, LogOut, Menu, X } from "lucide-react";
import { useScrolledPast } from "@/lib/hooks/useBrowserState";
import { NAV, NAV_BAR, type NavItem, type ViewKey } from "@/lib/admin/nav";
import type { AdminSession } from "@/lib/admin/api";

type Props = { view: ViewKey; unread: number; session: AdminSession | null; onGo: (view: ViewKey) => void; onSignOut: () => void };

/**
 * The studio's top bar, built like the public site's: a floating bar that turns into dark glass once the page scrolls,
 * hides while scrolling down, and becomes a full-height side drawer on phones.
 */
export function AdminNavbar({ view, unread, session, onGo, onSignOut }: Props) {
  const scrolled = useScrolledPast(36);
  const [hidden, setHidden] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const lastY = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const light = !scrolled;

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 36) setHidden(false);
      else if (y > lastY.current + 6 && y > 72) {
        setHidden(true);
        setOpenMenu(null);
      } else if (y < lastY.current - 6) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const outside = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === "keydown" && (event as KeyboardEvent).key !== "Escape") return;
      if (event.type === "mousedown" && barRef.current?.contains(event.target as Node)) return;
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", outside);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", outside);
    };
  }, [openMenu]);

  const closeDrawer = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setDrawer(false);
      setLeaving(false);
    }, 240);
  };
  useEffect(() => {
    if (!drawer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const go = (key: ViewKey) => {
    setOpenMenu(null);
    setDrawer(false);
    setLeaving(false);
    onGo(key);
  };
  const inGroup = (items: NavItem[]) => items.some((item) => item.key === view);

  const linkTone = (active: boolean) =>
    active ? (light ? "text-teal" : "text-[#7fd4c6]") : light ? "text-[#18302e] hover:text-teal" : "text-[#e6f4f1] hover:text-[#7fd4c6]";
  const pill = light ? "bg-[#e9f1ef] text-[#102927] hover:bg-[#dbe9e5]" : "bg-[#1b3a37] text-[#e6f4f1] hover:bg-[#244a46]";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-transform duration-300 ease-out-expo ${hidden ? "-translate-y-[130%] pointer-events-none" : "translate-y-0"} ${
          scrolled ? "px-6 sm:px-5 md:px-7 pt-2.5 sm:pt-3" : "px-[6px] pt-5 sm:pt-7"
        }`}
      >
        <div
          ref={barRef}
          className={`relative w-full max-w-[1200px] mx-auto rounded-full ${
            scrolled ? "bg-[#0b2220]/58 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_36px_rgba(8,27,26,0.18)] px-4 sm:px-8 py-1.5 sm:py-3.5" : "px-5 sm:px-8 bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => go("dashboard")} className="flex items-baseline gap-2.5 border-0 bg-transparent p-0 text-start cursor-pointer" aria-label="Content studio home">
              <span
                className={`bg-clip-text pb-[0.14em] font-sans text-[18px] sm:text-[21px] font-extrabold tracking-[-0.04em] text-transparent bg-linear-to-r ${
                  light ? "from-[#102927] via-[#176b69] to-[#2b8a87]" : "from-[#ffffff] via-[#bfe8df] to-[#63bdb0]"
                }`}
              >
                Mohammed Bajhaw
              </span>
              <span className={`hidden sm:inline font-mono text-[11px] font-bold tracking-[0.14em] ${light ? "text-teal" : "text-[#86dcd2]"}`}>STUDIO</span>
            </button>

            <div className="flex items-center gap-4 sm:gap-6">
              <nav aria-label="Studio sections" className="hidden md:flex items-center gap-3 font-sans text-[13px] font-semibold">
                {NAV_BAR.map((entry, index) => {
                  const separator =
                    index > 0 ? (
                      <span className={light ? "text-[#8ea5a1]" : "text-[#456f68]"} aria-hidden="true">
                        /
                      </span>
                    ) : null;
                  if (entry.type === "link") {
                    const active = view === entry.item.key;
                    return (
                      <span key={entry.item.key} className="inline-flex items-center gap-3">
                        {separator}
                        <button
                          type="button"
                          onClick={() => go(entry.item.key)}
                          aria-current={active ? "page" : undefined}
                          className={`inline-flex items-center gap-1.5 border-0 bg-transparent p-0 font-sans text-[13px] font-semibold cursor-pointer transition-colors duration-200 ${linkTone(active)}`}
                        >
                          {entry.item.label}
                          {entry.item.key === "messages" && unread > 0 && <span className="font-mono text-[12px] font-bold text-[#f0b36a]">{unread}</span>}
                        </button>
                      </span>
                    );
                  }
                  const active = inGroup(entry.items);
                  const open = openMenu === entry.label;
                  return (
                    <span key={entry.label} className="relative inline-flex items-center gap-3">
                      {separator}
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={open}
                        onClick={() => setOpenMenu(open ? null : entry.label)}
                        className={`inline-flex items-center gap-1 border-0 bg-transparent p-0 font-sans text-[13px] font-semibold cursor-pointer transition-colors duration-200 ${linkTone(active || open)}`}
                      >
                        {entry.label}
                        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                      </button>
                      {open && (
                        <div role="menu" className="absolute start-0 top-full mt-3.5 min-w-[196px] rounded-[18px] bg-[#0b2220]/95 backdrop-blur-xl backdrop-saturate-150 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] border border-white/[0.1]">
                          {entry.items.map((item) => {
                            const Icon = item.icon;
                            const selected = item.key === view;
                            return (
                              <button
                                key={item.key}
                                type="button"
                                role="menuitem"
                                onClick={() => go(item.key)}
                                className={`flex w-full items-center gap-3 rounded-[12px] border-0 px-3 py-2 text-start font-sans text-[13.5px] font-semibold cursor-pointer transition-colors duration-150 ${selected ? "bg-white/14 text-[#86dcd2]" : "bg-transparent text-[#ced3d3] hover:bg-white/8 hover:text-white"}`}
                              >
                                <Icon size={16} aria-hidden="true" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </span>
                  );
                })}
              </nav>

              <div className="hidden md:flex items-center gap-2">
                <Link href="/" target="_blank" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[12px] font-bold no-underline transition-colors duration-200 ${pill}`}>
                  <ExternalLink size={13} aria-hidden="true" /> Site
                </Link>
                <button type="button" onClick={onSignOut} title={session?.email ?? "Sign out"} className={`inline-flex items-center gap-1.5 rounded-full border-0 px-3 py-1.5 font-sans text-[12px] font-bold cursor-pointer transition-colors duration-200 ${pill}`}>
                  <LogOut size={13} aria-hidden="true" /> Sign out
                </button>
              </div>

              <button
                type="button"
                onClick={() => (drawer ? closeDrawer() : setDrawer(true))}
                aria-expanded={drawer}
                aria-controls="mobile-menu"
                aria-label={drawer ? "Close menu" : "Open menu"}
                className={`md:hidden grid w-9 h-9 place-items-center rounded-full border-0 bg-transparent p-0 cursor-pointer ${light ? "text-[#102927]" : "text-[#e6f4f1]"}`}
              >
                {drawer ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {drawer &&
        createPortal(
          <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Studio menu" data-leaving={leaving} className="drawer md:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#0b2220] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="pointer-events-none absolute -top-24 end-[-30%] w-[420px] h-[360px] rounded-full bg-radial from-[#176b69]/60 via-[#102927]/30 to-transparent blur-3xl" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-4">
              <span className="bg-linear-to-r from-[#ffffff] via-[#bfe8df] to-[#63bdb0] bg-clip-text pb-[0.14em] font-sans text-[18px] font-extrabold tracking-[-0.04em] text-transparent">Mohammed Bajhaw</span>
              <button type="button" onClick={closeDrawer} aria-label="Close menu" className="grid w-9 h-9 place-items-center rounded-full border-0 bg-transparent p-0 text-[#e6f4f1] cursor-pointer">
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Studio sections" className="relative mt-6 grid gap-4">
              {NAV.map((group) => (
                <section key={group.group} className="grid gap-1">
                  <p className="m-0 pb-1 font-mono text-[11px] font-bold tracking-[0.14em] text-[#74c1b8]">{group.group.toUpperCase()}</p>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === view;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => go(item.key)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 border-0 bg-transparent px-0 py-1.5 text-start font-sans text-[22px] font-bold leading-[1.15] tracking-[-0.03em] cursor-pointer transition-colors duration-150 ${active ? "text-[#7fd4c6]" : "text-[#e6f4f1]"}`}
                      >
                        <Icon size={22} aria-hidden="true" />
                        {item.label}
                        {item.key === "messages" && unread > 0 && <span className="font-mono text-[14px] font-bold text-[#f0b36a]">{unread}</span>}
                      </button>
                    );
                  })}
                </section>
              ))}
            </nav>
            <div className="relative mt-auto flex gap-2 pt-8">
              <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#17332f] px-3 py-3 font-sans text-[15px] font-bold text-[#86dcd2] no-underline">
                <ExternalLink size={16} aria-hidden="true" /> View site
              </Link>
              <button type="button" onClick={onSignOut} className="flex flex-1 items-center justify-center gap-2 rounded-full border-0 bg-transparent px-3 py-3 font-sans text-[15px] font-bold text-[#ced3d3] cursor-pointer">
                <LogOut size={16} aria-hidden="true" /> Sign out
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
