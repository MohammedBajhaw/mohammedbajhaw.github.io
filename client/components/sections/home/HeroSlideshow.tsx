"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePrefersReducedMotion } from "@/lib/hooks/useBrowserState";

type HeroSlideshowProps = {
  /** Pictures served by the API, in display order. One stays still; several fade into each other. */
  images: string[];
  /** Seconds each picture stays before the next fades in. */
  intervalSeconds: number;
};

/**
 * The hero's background pictures. Only the visible picture and its two neighbours are mounted, so a long list
 * (up to 20) never loads all at once; the next one is ready before it is shown. Visitors who asked for reduced
 * motion see the first picture without any rotation.
 */
export function HeroSlideshow({ images, intervalSeconds }: HeroSlideshowProps) {
  const calm = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const count = images.length;
  const rotating = count > 1 && !calm;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % count);
    }, Math.max(3, intervalSeconds) * 1000);
    return () => window.clearInterval(timer);
  }, [rotating, count, intervalSeconds]);

  if (count === 0) return null;
  const current = index % count;
  const mounted = new Set([current, (current + 1) % count, (current - 1 + count) % count]);

  return (
    <>
      {images.map((src, position) =>
        mounted.has(position) ? (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={position === 0}
            sizes="100vw"
            className={`object-cover object-[35%_22%] transition-opacity duration-[1400ms] ease-in-out ${position === current ? "opacity-100" : "opacity-0"}`}
          />
        ) : null,
      )}
    </>
  );
}
