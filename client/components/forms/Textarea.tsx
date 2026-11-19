"use client";

import { useId, useLayoutEffect, useRef, useState, type TextareaHTMLAttributes } from "react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { controlClass, cx, type ControlSize, type Tone } from "./styles";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> &
  FieldMeta & {
    tone?: Tone;
    size?: ControlSize;
    /** Grow with the text instead of scrolling (up to `maxRows`). */
    autoGrow?: boolean;
    maxRows?: number;
    /** Show "12 / 500" under the field. Needs `maxLength`. */
    showCount?: boolean;
  };

/** A multi-line field with optional auto-grow and character counter. */
export function Textarea({
  label,
  help,
  error,
  labelStyle,
  wide,
  wrapperClassName,
  tone = "soft",
  size = "md",
  autoGrow = false,
  maxRows = 14,
  showCount = false,
  id,
  required,
  rows = 4,
  className,
  onChange,
  value,
  defaultValue,
  maxLength,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const ref = useRef<HTMLTextAreaElement>(null);
  const [typedLength, setTypedLength] = useState(String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value).length : typedLength;

  // Resize after every render of a controlled value, and on typing for an uncontrolled one.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!autoGrow || !el) return;
    const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, line * maxRows + 24)}px`;
  }, [autoGrow, maxRows, value, length]);

  return (
    <FormField id={fieldId} label={label} help={help} error={error} required={required} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <textarea
        id={fieldId}
        ref={ref}
        rows={rows}
        required={required}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, help, error)}
        onChange={(event) => {
          setTypedLength(event.target.value.length);
          onChange?.(event);
        }}
        className={cx(controlClass({ tone, size, invalid: Boolean(error) }), autoGrow ? "resize-none overflow-y-auto" : "resize-y", className)}
        {...rest}
      />
      {showCount && maxLength && (
        <p className="m-0 mt-1.5 text-end font-mono text-[12px] text-[#6b7f7d]" dir="ltr" aria-hidden="true">
          {length} / {maxLength}
        </p>
      )}
    </FormField>
  );
}
