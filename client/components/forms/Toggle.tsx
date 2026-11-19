"use client";

import { useId } from "react";
import { cx, focusRing, type Tone } from "./styles";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  help?: string;
  tone?: Tone;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/** An on/off switch with its label and help text. Announced as a switch; Space and Enter flip it. */
export function Toggle({ checked, onChange, label, help, tone = "soft", disabled, id, className }: ToggleProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <button
      id={fieldId}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={help ? `${fieldId}-help` : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "group flex w-full items-center gap-4 rounded-[18px] border-0 px-4 py-3.5 text-start cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
        tone === "soft" ? "bg-[#f4f8f7] hover:bg-[#e9f1ef]" : "bg-white hover:bg-[#f4f8f7]",
        focusRing,
        className,
      )}
    >
      <span className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200", checked ? "bg-teal" : "bg-[#c4d3cf]")} aria-hidden="true">
        <span className={cx("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200", checked ? "start-[22px]" : "start-0.5")} />
      </span>
      <span className="grid gap-0.5">
        <strong className="font-sans text-[14px] font-bold text-[#0f2422] rtl:text-[16px]">{label}</strong>
        {help && (
          <small id={`${fieldId}-help`} className="font-sans text-[12.5px] leading-[1.45] text-[#6b7f7d] rtl:text-[14.5px]">
            {help}
          </small>
        )}
      </span>
    </button>
  );
}
