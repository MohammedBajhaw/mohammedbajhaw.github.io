"use client";

import { useId, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { controlClass, cx, type ControlSize, type Tone } from "./styles";

export type SelectOption = { value: string | number; label: string; disabled?: boolean };

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> &
  FieldMeta & {
    tone?: Tone;
    size?: ControlSize;
    /** Pass options as data, or write your own <option> elements as children. */
    options?: SelectOption[];
    /** An empty first choice, for "nothing picked yet". */
    placeholder?: string;
    children?: ReactNode;
  };

/** A native dropdown (keyboard and mobile friendly) with the site's look and a custom arrow. */
export function Select({
  label,
  help,
  error,
  labelStyle,
  wide,
  wrapperClassName,
  tone = "soft",
  size = "md",
  options,
  placeholder,
  id,
  required,
  className,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <FormField id={fieldId} label={label} help={help} error={error} required={required} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, help, error)}
          className={cx(controlClass({ tone, size, invalid: Boolean(error) }), "cursor-pointer appearance-none pe-11", className)}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown size={17} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-[#6b7f7d]" aria-hidden="true" />
      </div>
    </FormField>
  );
}
