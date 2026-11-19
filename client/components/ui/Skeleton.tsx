type SkeletonProps = {
  className?: string;
  tone?: "light" | "dark";
};

export function Skeleton({ className = "", tone = "light" }: SkeletonProps) {
  const baseTone = tone === "dark" ? "bg-white/[0.09]" : "bg-black/[0.06]";
  const sweepTone =
    tone === "dark"
      ? "from-transparent via-white/[0.16] to-transparent"
      : "from-transparent via-white/80 to-transparent";

  return (
    <span
      aria-hidden="true"
      className={`relative block overflow-hidden rounded-[12px] ${baseTone} ${className}`.trim()}
    >
      <span
        className={`pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r ${sweepTone} animate-shimmer motion-reduce:animate-none`}
      />
    </span>
  );
}
