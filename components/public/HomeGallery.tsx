"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { buildGallerySlides } from "@/lib/gallery";

const INTERVAL_MS = 5200;

export function HomeGallery({ projects, publications }: { projects: Record<string, any>[]; publications: Record<string, any>[] }) {
  const slides = useMemo(() => buildGallerySlides(projects, publications), [projects, publications]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hovering, setHovering] = useState(false);
  const touchStart = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  const go = useCallback((next: number) => {
    if (count > 0) setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || hovering || reduceMotion) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [count, go, hovering, index, paused, reduceMotion]);

  if (count === 0) return null;
  const active = slides[index];

  return <section className="section gallery-section" aria-roledescription="carousel" aria-label="Project and research gallery">
    <div className="shell">
      <div className="section-title-row"><div><p className="index">IN PICTURES</p><h2>The work, up close.</h2></div></div>
      <div
        className="gallery"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => setHovering(true)}
        onBlur={() => setHovering(false)}
        onKeyDown={(event) => { if (event.key === "ArrowLeft") go(index - 1); if (event.key === "ArrowRight") go(index + 1); }}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const delta = event.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        <div className="gallery-stage">
          {slides.map((slide, i) => {
            const near = Math.abs(i - index) <= 1 || (index === 0 && i === count - 1) || (index === count - 1 && i === 0);
            return <figure className={`gallery-slide${i === index ? " is-active" : ""}`} key={slide.src} aria-hidden={i !== index} role="group" aria-label={`${i + 1} of ${count}`}>
              {near && <><img className="gallery-backdrop" src={slide.src} alt="" aria-hidden="true" loading="lazy" /><img className="gallery-image" src={slide.src} alt={slide.alt} loading={i === 0 ? "eager" : "lazy"} /></>}
            </figure>;
          })}
          <button type="button" className="gallery-arrow gallery-arrow-prev" onClick={() => go(index - 1)} aria-label="Previous image"><ChevronLeft size={22} aria-hidden="true" /></button>
          <button type="button" className="gallery-arrow gallery-arrow-next" onClick={() => go(index + 1)} aria-label="Next image"><ChevronRight size={22} aria-hidden="true" /></button>
          {!paused && !reduceMotion && count > 1 && !hovering && <span className="gallery-progress" key={`${index}-progress`} style={{ animationDuration: `${INTERVAL_MS}ms` }} aria-hidden="true" />}
        </div>
        <div className="gallery-footer" aria-live="polite">
          <div>
            <span className="gallery-kind">{active.kind}</span>
            <strong>{active.title}</strong>
          </div>
          <div className="gallery-controls">
            <Link className="gallery-link" href={active.href}>{active.kind === "Project" ? "View project" : "Read paper"} <span aria-hidden="true">→</span></Link>
            <span className="gallery-count">{String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</span>
            {!reduceMotion && <button type="button" className="gallery-toggle" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>}
          </div>
        </div>
        <div className="gallery-dots" role="tablist" aria-label="Choose image">
          {slides.map((slide, i) => <button type="button" role="tab" aria-selected={i === index} aria-label={`Show image ${i + 1}`} className={i === index ? "is-active" : ""} key={slide.src} onClick={() => go(i)} />)}
        </div>
      </div>
    </div>
  </section>;
}
