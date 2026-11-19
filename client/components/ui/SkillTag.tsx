import { SkillIcon } from "@/components/motifs/SkillIcon";
import { Skeleton } from "@/components/ui/Skeleton";

export type SkillTagProps = {
  label: string;
  iconName?: string | null;
  category: string;
  size?: "sm" | "md";
  className?: string;
};

export function SkillTag({ label, iconName, category, size = "md", className = "" }: SkillTagProps) {
  const textClass = size === "sm" ? "text-[12.5px] gap-1.5 rtl:text-[15.5px]" : "text-[14.5px] gap-2.5 rtl:text-[17.5px]";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <span
      className={`inline-flex items-center font-sans font-semibold text-[#17302e] bg-transparent border-0 p-0 select-none transition-transform duration-180 ease-out-expo origin-left rtl:origin-right hover:scale-[1.04] ${textClass} ${className}`.trim()}
    >
      <SkillIcon label={label} iconName={iconName} category={category} bare size={iconSize} />
      <span className="leading-[1.35]">{label}</span>
    </span>
  );
}

export function SkillTagSkeleton({ size = "md", className = "" }: { size?: "sm" | "md"; className?: string }) {
  const gapClass = size === "sm" ? "gap-1.5" : "gap-2.5";
  const iconClass = size === "sm" ? "w-3.5 h-3.5 rounded-full" : "w-4 h-4 rounded-full";
  const labelClass = size === "sm" ? "h-3.5 w-20 rounded-full" : "h-4 w-28 rounded-full";

  return (
    <span className={`inline-flex items-center bg-transparent border-0 p-0 ${gapClass} ${className}`.trim()} aria-hidden="true">
      <Skeleton className={iconClass} />
      <Skeleton className={labelClass} />
    </span>
  );
}
