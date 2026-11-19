"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Languages, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { useScrolledPast } from "@/lib/hooks/useBrowserState";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/lib/i18n/config";
import { persistLocale } from "@/lib/i18n/persist";
import { NAV_LINKS, SITE_NAME } from "@/lib/site";

export type NavbarProps = {
  name?: string;
};

export function Navbar({ name = SITE_NAME }: NavbarProps) {
  const pathname = usePathname() ?? "/";
  const { t, locale, href } = useI18n();
  const barePath = stripLocale(pathname);
  const isHome = barePath === "/";
  /** Pages whose header band is dark like the footer, so the bar uses the light-on-dark look. */
  const hasDarkHeader =
    isHome ||
    ["/projects", "/services", "/contact"].includes(barePath) ||
    barePath.startsWith("/projects/") ||
    barePath.startsWith("/publications/") ||
    barePath.startsWith("/achievements/");

  // The bar hides while scrolling down; storing the path it was hidden on makes it reappear on any navigation.
  const [hiddenOn, setHiddenOn] = useState<string | null>(null);
  const visible = hiddenOn !== pathname;
  const scrolled = useScrolledPast(36);
  const [langOpen, setLangOpen] = useState(false);
  // Phone/tablet menu: remembered per path so any navigation closes it.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const menuOpen = menuOpenOn === pathname;
  const [leaving, setLeaving] = useState(false);
  const closeMenu = () => {
    setLeaving(true);
    window.setTimeout(() => {
      setMenuOpenOn(null);
      setLeaving(false);
    }, 240);
  };
  const lastYRef = useRef(0);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const lastY = lastYRef.current;

      if (currentY <= 36) {
        setHiddenOn(null);
      } else if (currentY > lastY + 6 && currentY > 72) {
        setHiddenOn(pathname);
        setLangOpen(false);
      } else if (currentY < lastY - 6) {
        setHiddenOn(null);
      }

      lastYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!langOpen) return;
    const handleOutside = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === "keydown" && (event as KeyboardEvent).key === "Escape") {
        setLangOpen(false);
        return;
      }
      if (event.type === "mousedown" && langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleOutside);
    };
  }, [langOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  /** Remember the choice so the proxy sends the visitor to this language next time. */
  const rememberLocale = (code: Locale) => {
    persistLocale(code);
    setLangOpen(false);
  };

  const activeLocale = LOCALE_META[locale];
  const showFloatingGlass = scrolled;
  const isLightTop = !hasDarkHeader && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 will-change-transform transition-transform duration-300 ease-out-expo ${
          visible ? "translate-y-0 pointer-events-auto" : "-translate-y-[130%] pointer-events-none"
        } ${showFloatingGlass ? "px-6 sm:px-5 md:px-7 pt-2.5 sm:pt-3" : "px-[6px] pt-5 sm:pt-7"}`}
      >
        <div
          className={`relative w-full max-w-[1200px] mx-auto rounded-full ${
            showFloatingGlass
              ? "bg-[#0b2220]/58 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_36px_rgba(8,27,26,0.18)] px-4 sm:px-8 py-1.5 sm:py-3.5"
              : "px-5 sm:px-8 py-0 bg-transparent"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              data-display
              href={href("/")}
              className={`font-sans text-[18px] sm:text-[21px] rtl:text-[22px] rtl:sm:text-[26px] font-extrabold tracking-[-0.04em] pb-[0.14em] bg-clip-text text-transparent transition-opacity ${
                isLightTop
                  ? "bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87]"
                  : "bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0]"
              }`}
            >
              {name}
            </Link>

            <div className="flex items-center gap-4 sm:gap-6">
              <nav
                aria-label={t("nav.primary")}
                className={`hidden md:flex items-center gap-3 font-sans text-[13px] rtl:text-[16.5px] font-semibold ${
                  isLightTop ? "text-[#18302e]" : "text-[#e6f4f1]"
                }`}
              >
                {NAV_LINKS.map((link, idx) => {
                  const isActive = link.href === "/" ? barePath === "/" : barePath.startsWith(link.href);
                  return (
                    <span key={link.href} className="inline-flex items-center gap-2.5 sm:gap-3">
                      {idx > 0 && (
                        <span className={isLightTop ? "text-[#8ea5a1]" : "text-[#456f68]"} aria-hidden="true">
                          /
                        </span>
                      )}
                      <Link
                        href={href(link.href)}
                        className={`transition-colors duration-200 ${
                          isActive
                            ? isLightTop
                              ? "text-teal"
                              : "text-[#7fd4c6]"
                            : isLightTop
                              ? "hover:text-teal"
                              : "hover:text-[#7fd4c6]"
                        }`}
                      >
                        {t(`nav.${link.key}`)}
                      </Link>
                    </span>
                  );
                })}
              </nav>

              {/* Language Switcher (EN / AR / TR) */}
              <div className="relative hidden md:block" ref={langMenuRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                  aria-label={t("nav.changeLanguage")}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-sans text-[11.5px] rtl:text-[14.5px] font-bold tracking-[0.04em] border-0 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2 ${
                    isLightTop
                      ? "bg-[#f2f6f5] text-[#102927] hover:bg-[#e5efed]"
                      : "bg-white/12 backdrop-blur-md text-[#e6f4f1] hover:bg-white/20"
                  }`}
                >
                  <Languages
                    size={13}
                    className={`shrink-0 ${isLightTop ? "text-teal" : "text-[#86dcd2]"}`}
                    aria-hidden="true"
                  />
                  <span>{activeLocale.short}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${langOpen ? "rotate-180" : ""} ${
                      isLightTop ? "text-[#438785]" : "text-[#6eb7af]"
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {langOpen && (
                  <div
                    role="menu"
                    aria-label={t("nav.selectLanguage")}
                    className="absolute end-0 mt-2.5 min-w-[112px] rounded-[18px] bg-[#0b2220]/72 backdrop-blur-xl backdrop-saturate-150 p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] border border-white/[0.1]"
                  >
                    {LOCALES.map((code) => {
                      const item = LOCALE_META[code];
                      const selected = code === locale;
                      return (
                        <Link
                          key={code}
                          href={localePath(code, barePath)}
                          hrefLang={code}
                          lang={code}
                          aria-label={item.label}
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => rememberLocale(code)}
                          className={`flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2 font-sans text-[12.5px] font-semibold border-0 cursor-pointer no-underline transition-colors duration-150 ${
                            selected
                              ? "bg-white/14 text-[#86dcd2]"
                              : "bg-transparent text-[#ced3d3] hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          <span>{item.short}</span>
                          {selected && <Check size={13} className="text-[#86dcd2] shrink-0" aria-hidden="true" />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Phone / tablet: one button opens a panel with the links and the language choice */}
              <button
                type="button"
                onClick={() => (menuOpen ? closeMenu() : setMenuOpenOn(pathname))}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                className={`md:hidden grid w-9 h-9 place-items-center rounded-full border-0 bg-transparent p-0 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2 ${
                  isLightTop ? "text-[#102927]" : "text-[#e6f4f1]"
                }`}
              >
                {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {menuOpen &&
            createPortal(
              <div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                aria-label={t("nav.primary")}
                data-leaving={leaving}
                className="drawer md:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#0b2220] px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
              >
                <div
                  className="pointer-events-none absolute -top-24 end-[-30%] w-[420px] h-[360px] rounded-full bg-radial from-[#176b69]/60 via-[#102927]/30 to-transparent blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative flex items-center justify-between gap-4">
                  <Link
                    data-display
                    href={href("/")}
                    className="font-sans text-[18px] rtl:text-[22px] font-extrabold tracking-[-0.04em] pb-[0.14em] bg-clip-text text-transparent bg-linear-to-r rtl:bg-linear-to-l from-[#ffffff] via-[#bfe8df] to-[#63bdb0]"
                  >
                    {name}
                  </Link>
                  <button
                    type="button"
                    onClick={closeMenu}
                    aria-label={t("nav.closeMenu")}
                    className="grid w-9 h-9 place-items-center rounded-full border-0 bg-transparent p-0 text-[#e6f4f1] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2"
                  >
                    <X size={22} aria-hidden="true" />
                  </button>
                </div>

                <nav aria-label={t("nav.primary")} className="relative mt-10 grid gap-1">
                  {NAV_LINKS.map((link) => {
                    const isActive = link.href === "/" ? barePath === "/" : barePath.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={href(link.href)}
                        className={`py-3 font-sans text-[32px] rtl:text-[36px] font-bold leading-[1.15] tracking-[-0.03em] transition-colors duration-150 ${
                          isActive ? "text-[#7fd4c6]" : "text-[#e6f4f1] hover:text-[#7fd4c6]"
                        }`}
                      >
                        {t(`nav.${link.key}`)}
                      </Link>
                    );
                  })}
                </nav>

                <div role="group" aria-label={t("nav.selectLanguage")} className="relative mt-auto pt-8 flex gap-2">
                  {LOCALES.map((code) => {
                    const item = LOCALE_META[code];
                    const selected = code === locale;
                    return (
                      <Link
                        key={code}
                        href={localePath(code, barePath)}
                        hrefLang={code}
                        lang={code}
                        aria-label={item.label}
                        aria-current={selected}
                        onClick={() => rememberLocale(code)}
                        className={`flex-1 rounded-full px-3 py-3 text-center font-sans text-[15px] rtl:text-[17px] font-bold no-underline transition-colors duration-150 ${
                          selected ? "bg-[#17332f] text-[#86dcd2]" : "text-[#ced3d3] hover:bg-[#17332f]"
                        }`}
                      >
                        {item.short}
                      </Link>
                    );
                  })}
                </div>
              </div>,
              document.body,
            )}
        </div>
      </header>
    </>
  );
}
