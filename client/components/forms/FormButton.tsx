"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cx } from "./styles";

const BASE =
  "group inline-flex items-center justify-center gap-2 rounded-full border-0 font-sans font-semibold cursor-pointer select-none transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-[#86dcd2] focus-visible:outline-offset-2";

const VARIANTS = {
  primary: "text-white bg-linear-45 from-[#0c4545] via-[#176b69] to-[#268c89] shadow-[0_10px_22px_rgba(12,69,69,0.26)]",
  ghost: "bg-white text-[#102927] shadow-[0_6px_18px_rgba(16,41,39,0.07)] hover:bg-[#e5efed]",
  soft: "bg-[#e5efed] text-[#0c4545] hover:bg-[#d7e8e4]",
  danger: "bg-[#fbeeee] text-[#a32a2a] hover:bg-[#f6dede]",
} as const;

const SIZES = {
  md: "h-11 px-6 text-[14px] rtl:text-[16px]",
  sm: "h-9 px-4 text-[13px] rtl:text-[15px]",
} as const;

export type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Shows a spinner and disables the button while work is in progress. */
  busy?: boolean;
  icon?: ReactNode;
};

/** The button for forms: four looks, two sizes, a busy state. Submits by default when inside a <form> with type="submit". */
export function FormButton({ variant = "primary", size = "md", busy, icon, className, children, disabled, type = "button", ...rest }: FormButtonProps) {
  return (
    <button type={type} disabled={disabled || busy} aria-busy={busy || undefined} className={cx(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : icon}
      <span className="inline-flex items-center gap-2 transition-transform duration-180 ease-out-expo group-hover:scale-[1.04]">{children}</span>
    </button>
  );
}
