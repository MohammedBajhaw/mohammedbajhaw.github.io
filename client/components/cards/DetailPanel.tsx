import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const FRAME = "rounded-[28px] sm:rounded-[34px] bg-[#f4f8f7] border-0 px-6 py-6 sm:px-7 sm:py-7";

/** Borderless surface for side facts on detail pages (system stack, outcomes, publication details). */
export function DetailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={FRAME}>
      <p className="mono-eyebrow m-0 mb-3">{title}</p>
      {children}
    </section>
  );
}

/** Divider-separated rows inside a DetailPanel (internal dividers only, no outer border). */
export const DETAIL_ROW = "py-3 border-b border-[#e1ecea] last:border-b-0 last:pb-0 font-sans text-[14px] leading-[1.6] rtl:text-[17px]";

export function DetailPanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={FRAME} aria-hidden="true">
      <Skeleton className="mb-4 h-3.5 w-28 rounded-full" />
      <div className="grid gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-[88%] rounded-full" />
        ))}
      </div>
    </div>
  );
}
