"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { controlClass, cx, focusRing, type ControlSize, type Tone } from "./styles";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

function parseInitialMonth(value: string): { year: number; month: number; selected: string | null } {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]) - 1;
    if (month >= 0 && month <= 11) return { year, month, selected: value.trim() };
  }
  const yearOnly = /^(\d{4})$/.exec(value.trim());
  if (yearOnly) {
    return { year: Number(yearOnly[1]), month: 0, selected: null };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), selected: null };
}

export type DatePickerProps = FieldMeta & {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowPresent?: boolean;
  required?: boolean;
  tone?: Tone;
  size?: ControlSize;
  dir?: "ltr" | "rtl";
};

/** Single-line date field with a clean interactive calendar popover (supports ISO YYYY-MM-DD and optional "Present"). */
export function DatePicker({
  id,
  label,
  help,
  error,
  required,
  labelStyle,
  wide,
  wrapperClassName,
  value,
  onChange,
  placeholder = "Select date",
  allowPresent = false,
  tone = "soft",
  size = "md",
  dir = "ltr",
}: DatePickerProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = parseInitialMonth(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  useEffect(() => {
    if (!open) return;
    const handle = (event: MouseEvent | KeyboardEvent) => {
      if (event.type === "keydown" && (event as KeyboardEvent).key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.type === "mousedown" && rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handle);
    };
  }, [open]);

  const toggleOpen = () => {
    if (!open) {
      const next = parseInitialMonth(value);
      setViewYear(next.year);
      setViewMonth(next.month);
    }
    setOpen((prev) => !prev);
  };

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  const stepMonth = (delta: number) => {
    const target = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  const pickDate = (day: number) => {
    onChange(`${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`);
    setOpen(false);
  };

  const years: number[] = [];
  for (let y = 1980; y <= 2040; y += 1) years.push(y);

  return (
    <FormField
      id={fieldId}
      label={label}
      help={help}
      error={error}
      required={required}
      labelStyle={labelStyle}
      wide={wide}
      wrapperClassName={wrapperClassName}
    >
      <div ref={rootRef} className="relative">
        <button
          id={fieldId}
          type="button"
          dir={dir}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={describedBy(fieldId, help, error)}
          onClick={toggleOpen}
          className={cx(
            controlClass({ tone, size, invalid: Boolean(error) }),
            "flex items-center justify-between gap-2 text-start cursor-pointer",
            value ? "text-ink" : "text-[#6b7f7d]",
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <Calendar size={16} className="shrink-0 text-[#526563]" aria-hidden="true" />
        </button>

        {open && (
          <div
            role="dialog"
            aria-label={label ?? "Choose date"}
            dir="ltr"
            className="absolute start-0 top-[calc(100%+8px)] z-50 w-[min(300px,calc(100vw-2rem))] rounded-[24px] bg-white p-4 shadow-[0_20px_50px_rgba(16,41,39,0.2)] border border-[#dce8e5]"
          >
            {/* Month / Year controls */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => stepMonth(-1)}
                className={cx("grid size-8 place-items-center rounded-full bg-[#f4f8f7] text-[#102927] hover:bg-[#e2efec] border-0 cursor-pointer", focusRing)}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>

              <div className="flex items-center gap-1.5">
                <select
                  aria-label="Month"
                  value={viewMonth}
                  onChange={(event) => setViewMonth(Number(event.target.value))}
                  className="rounded-lg border-0 bg-[#f4f8f7] px-2 py-1 font-sans text-[13px] font-bold text-[#0f2422] cursor-pointer"
                >
                  {MONTHS.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Year"
                  value={viewYear}
                  onChange={(event) => setViewYear(Number(event.target.value))}
                  className="rounded-lg border-0 bg-[#f4f8f7] px-2 py-1 font-sans text-[13px] font-bold text-[#0f2422] cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => stepMonth(1)}
                className={cx("grid size-8 place-items-center rounded-full bg-[#f4f8f7] text-[#102927] hover:bg-[#e2efec] border-0 cursor-pointer", focusRing)}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Weekday header */}
            <div className="mb-1.5 grid grid-cols-7 text-center font-sans text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7f7d]">
              {WEEKDAYS.map((day) => (
                <span key={day} className="py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }).map((_, idx) => (
                <span key={`empty-${idx}`} aria-hidden="true" />
              ))}
              {Array.from({ length: daysInMonth }, (_, idx) => {
                const day = idx + 1;
                const iso = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`;
                const isSelected = parsed.selected === iso;
                const isToday = todayIso === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => pickDate(day)}
                    className={cx(
                      "grid h-8 w-full place-items-center rounded-full border-0 font-sans text-[13px] font-semibold cursor-pointer transition-colors",
                      focusRing,
                      isSelected
                        ? "bg-teal text-white"
                        : isToday
                          ? "bg-[#e3f1ee] text-teal hover:bg-[#d2eae4]"
                          : "bg-transparent text-[#102927] hover:bg-[#f4f8f7]",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer shortcuts */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#ebf2f0] pt-3">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange(todayIso);
                    setOpen(false);
                  }}
                  className={cx("rounded-full border-0 bg-[#eef6f4] px-3 py-1 font-sans text-[12px] font-bold text-teal hover:bg-[#dfeeea] cursor-pointer", focusRing)}
                >
                  Today
                </button>
                {allowPresent && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("Present");
                      setOpen(false);
                    }}
                    className={cx("rounded-full border-0 bg-[#eef6f4] px-3 py-1 font-sans text-[12px] font-bold text-teal hover:bg-[#dfeeea] cursor-pointer", focusRing)}
                  >
                    Present
                  </button>
                )}
              </div>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={cx("inline-flex items-center gap-1 rounded-full border-0 bg-transparent px-2.5 py-1 font-sans text-[12px] font-semibold text-[#526563] hover:bg-[#fbeeee] hover:text-[#a32a2a] cursor-pointer", focusRing)}
                >
                  <X size={12} aria-hidden="true" />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </FormField>
  );
}
