"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

export type MediaGalleryItem = { id: string | number; src: string; alt: string; caption?: string | null };

type ZoomSize = { width: number; height: number };

export function MediaGallery({ items }: { items: MediaGalleryItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomFocus = useRef({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState<number | null>(null);
  const [zoom, setZoom] = useState<ZoomSize | null>(null);
  const item = active === null ? undefined : items[active];

  // Keep the point the visitor zoomed into in the middle of the screen.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!zoom || !stage) return;
    stage.scrollLeft = zoomFocus.current.x * stage.scrollWidth - stage.clientWidth / 2;
    stage.scrollTop = zoomFocus.current.y * stage.scrollHeight - stage.clientHeight / 2;
  }, [zoom]);

  function open(index: number) {
    setActive(index);
    setZoom(null);
    dialogRef.current?.showModal();
  }

  function go(step: number) {
    setActive((current) => (current === null ? current : (current + step + items.length) % items.length));
    setZoom(null);
  }

  // The size at which the image fits the stage, used to place clicks and to size the zoom.
  function fitted() {
    const image = imageRef.current;
    const stage = stageRef.current;
    if (!image?.naturalWidth || !image.naturalHeight || !stage) return null;
    const { naturalWidth, naturalHeight } = image;
    const { clientWidth, clientHeight } = stage;
    const scale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
    return { naturalWidth, naturalHeight, clientWidth, clientHeight, scale };
  }

  function zoomIn(focusX = 0.5, focusY = 0.5) {
    const fit = fitted();
    if (!fit) return;
    // Very wide or tall figures grow towards filling the stage, up to 4x, so their text is readable on a phone too.
    const fill = Math.max(fit.clientWidth / fit.naturalWidth, fit.clientHeight / fit.naturalHeight);
    const scale = Math.max(fit.scale * 2, Math.min(fill, fit.scale * 4));
    zoomFocus.current = { x: focusX, y: focusY };
    setZoom({ width: Math.round(fit.naturalWidth * scale), height: Math.round(fit.naturalHeight * scale) });
  }

  function handleImageClick(event: MouseEvent<HTMLImageElement>) {
    event.stopPropagation();
    if (zoom) return setZoom(null);
    const fit = fitted();
    if (!fit) return;
    const box = event.currentTarget.getBoundingClientRect();
    const width = fit.naturalWidth * fit.scale;
    const height = fit.naturalHeight * fit.scale;
    const x = (event.clientX - box.left - (box.width - width) / 2) / width;
    const y = (event.clientY - box.top - (box.height - height) / 2) / height;
    // The image element fills the stage, so a click beside the picture counts as a click outside it.
    if (x < 0 || x > 1 || y < 0 || y > 1) return dialogRef.current?.close();
    zoomIn(x, y);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (zoom || items.length < 2) return;
    if (event.key === "ArrowLeft") go(-1);
    if (event.key === "ArrowRight") go(1);
  }

  return (
    <>
      <div className="media-grid">
        {items.map((entry, index) => (
          <figure key={entry.id}>
            <button type="button" className="media-open" onClick={() => open(index)} aria-label={`Enlarge image: ${entry.alt}`}>
              <img src={entry.src} alt={entry.alt} loading="lazy" />
              <span className="media-open-hint" aria-hidden="true"><ZoomIn size={16} /></span>
            </button>
            <figcaption>{entry.caption}</figcaption>
          </figure>
        ))}
      </div>
      <dialog ref={dialogRef} className="lightbox" aria-label="Enlarged image" onClose={() => { setActive(null); setZoom(null); }} onKeyDown={handleKeyDown}>
        {item && (
          <>
            <div className="lightbox-bar">
              <div className="lightbox-tools">
                {items.length > 1 && <button type="button" className="lightbox-button" onClick={() => go(-1)} aria-label="Previous image"><ChevronLeft size={20} aria-hidden="true" /></button>}
                <span className="lightbox-count">{(active ?? 0) + 1} / {items.length}</span>
                {items.length > 1 && <button type="button" className="lightbox-button" onClick={() => go(1)} aria-label="Next image"><ChevronRight size={20} aria-hidden="true" /></button>}
              </div>
              <div className="lightbox-tools">
                <button type="button" className="lightbox-button" onClick={() => (zoom ? setZoom(null) : zoomIn())} aria-label={zoom ? "Fit image to screen" : "Zoom in"}>
                  {zoom ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
                </button>
                <button type="button" className="lightbox-button" onClick={() => dialogRef.current?.close()} aria-label="Close"><X size={20} aria-hidden="true" /></button>
              </div>
            </div>
            <div ref={stageRef} className={`lightbox-stage${zoom ? " is-zoomed" : ""}`} onClick={() => dialogRef.current?.close()}>
              <img key={item.id} ref={imageRef} src={item.src} alt={item.alt} style={zoom ?? undefined} onClick={handleImageClick} />
            </div>
            {item.caption && <p className="lightbox-caption">{item.caption}</p>}
          </>
        )}
      </dialog>
    </>
  );
}
