import { cx } from "./styles";

type ProgressBarProps = {
  /** 0 to 100. Leave it out for an indeterminate bar (work of unknown length). */
  value?: number;
  label: string;
  tone?: "teal" | "danger";
  className?: string;
};

/** A thin progress bar with the right ARIA progressbar semantics. */
export function ProgressBar({ value, label, tone = "teal", className }: ProgressBarProps) {
  const determinate = value !== undefined;
  const percent = determinate ? Math.max(0, Math.min(100, Math.round(value))) : undefined;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={cx("relative h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e6]", className)}>
      <span
        className={cx(
          "absolute inset-y-0 start-0 rounded-full",
          tone === "teal" ? "bg-linear-to-r from-[#268c89] to-[#86dcd2]" : "bg-[#c0392b]",
          determinate ? "transition-[width] duration-200 ease-out" : "w-2/5 animate-shimmer motion-reduce:animate-none",
        )}
        style={determinate ? { width: `${percent}%` } : undefined}
      />
    </div>
  );
}
