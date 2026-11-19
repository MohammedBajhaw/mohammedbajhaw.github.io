/**
 * Shared look of every form control. One place decides how a field, its label and its messages look,
 * so the studio, the contact page and anything built later stay identical.
 *
 * Tone: the fill of a field. `soft` is the default on white surfaces; `white` is for fields placed on a soft grey card.
 * Label style: `default` is the bold sentence-case label; `eyebrow` is the small uppercase label of the public site.
 */

export type Tone = "soft" | "white";
export type LabelStyle = "default" | "eyebrow";
export type ControlSize = "md" | "sm";

export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

const TONE: Record<Tone, string> = { soft: "bg-[#f4f8f7]", white: "bg-white" };
const SIZE: Record<ControlSize, string> = {
  md: "px-4 py-3 text-[15px] rtl:text-[17px]",
  sm: "px-3.5 py-2 text-[14px] rtl:text-[16px]",
};

/** The box of a text-like control (input, textarea, select, tag input). */
export function controlClass({ tone = "soft", size = "md", invalid = false }: { tone?: Tone; size?: ControlSize; invalid?: boolean }) {
  return cx(
    "w-full rounded-[16px] border-0 font-sans leading-[1.5] text-[#0f2422] outline-none",
    "transition-shadow duration-150 placeholder:text-[#8aa19d] disabled:cursor-not-allowed disabled:opacity-60",
    TONE[tone],
    SIZE[size],
    invalid ? "shadow-[0_0_0_2px_#c0392b]" : "focus:shadow-[0_0_0_2px_#176b69]",
  );
}

export function labelClass(style: LabelStyle = "default") {
  return style === "eyebrow"
    ? "mb-2 block font-sans text-[11px] font-bold tracking-[0.1em] uppercase text-[#4b635f] rtl:text-[13.5px]"
    : "mb-1.5 block font-sans text-[13px] font-bold text-[#41605b] rtl:text-[15px]";
}

export const helpClass = "m-0 mt-1.5 font-sans text-[12.5px] leading-[1.5] text-[#6b7f7d] rtl:text-[14.5px]";
export const errorClass = "m-0 mt-1.5 font-sans text-[12.5px] font-semibold leading-[1.5] text-[#a32a2a] rtl:text-[14.5px]";

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b69]";
