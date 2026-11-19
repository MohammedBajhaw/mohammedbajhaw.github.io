"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/useBrowserState";

export type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  immediate?: boolean;
};

export function Reveal({ children, delay = 0, className = "", immediate = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [observed, setObserved] = useState(false);
  const reduced = usePrefersReducedMotion();
  const shown = observed || reduced;

  useEffect(() => {
    if (reduced) return;

    if (immediate) {
      const frame = requestAnimationFrame(() => setObserved(true));
      return () => cancelAnimationFrame(frame);
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setObserved(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [immediate, reduced]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: shown && delay > 0 ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-[500ms] ease-out-expo motion-reduce:transition-none motion-reduce:transform-none ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[14px] [@media(scripting:none)]:opacity-100 [@media(scripting:none)]:translate-y-0"
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}
