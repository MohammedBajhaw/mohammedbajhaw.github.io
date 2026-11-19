"use client";

import type { ReactNode } from "react";
import { cx, focusRing } from "./styles";

export type SegmentOption<T extends string> = { value: T; label: string; disabled?: boolean };

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the whole group. */
  label: string;
  /** `tabs` for switching what is shown below, `choice` for picking a value. */
  role?: "tabs" | "choice";
  /** Replace what each option shows (for example to add a marker). */
  renderOption?: (option: SegmentOption<T>, selected: boolean) => ReactNode;
  className?: string;
};

/** A row of two to five exclusive choices in a soft rounded tray: language tabs, message status, view modes. */
export function SegmentedControl<T extends string>({ options, value, onChange, label, role = "choice", renderOption, className }: SegmentedControlProps<T>) {
  return (
    <div role={role === "tabs" ? "tablist" : "radiogroup"} aria-label={label} className={cx("inline-flex w-fit max-w-full flex-wrap items-center gap-1 rounded-[22px] bg-[#f4f8f7] p-1", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role={role === "tabs" ? "tab" : "radio"}
            aria-selected={role === "tabs" ? selected : undefined}
            aria-checked={role === "choice" ? selected : undefined}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cx(
              "inline-flex items-center gap-2 rounded-[18px] border-0 px-4 py-2 font-sans text-[13.5px] font-bold cursor-pointer transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 rtl:text-[15.5px]",
              selected ? "bg-white text-[#0c4545] shadow-[0_4px_14px_rgba(16,41,39,0.08)]" : "bg-transparent text-[#526563] hover:text-[#0c4545]",
              focusRing,
            )}
          >
            {renderOption ? renderOption(option, selected) : option.label}
          </button>
        );
      })}
    </div>
  );
}
