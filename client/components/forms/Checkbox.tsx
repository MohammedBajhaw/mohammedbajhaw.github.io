"use client";

import { useId, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { errorClass, cx } from "./styles";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "checked" | "size"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  help?: string;
  error?: string;
};

/** A real checkbox (native, so forms and keyboards just work) drawn in the site's style. */
export function Checkbox({ checked, onChange, label, help, error, id, className, ...rest }: CheckboxProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="group inline-flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
          <input
            id={fieldId}
            type="checkbox"
            checked={checked}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : help ? `${fieldId}-help` : undefined}
            onChange={(event) => onChange(event.target.checked)}
            className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[7px] bg-[#dfe9e6] transition-colors duration-150 checked:bg-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176b69] disabled:cursor-not-allowed disabled:opacity-60"
            {...rest}
          />
          <Check size={13} strokeWidth={3} className="pointer-events-none relative text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100" aria-hidden="true" />
        </span>
        <span className="grid gap-0.5">
          <span className="font-sans text-[14px] font-semibold leading-[1.45] text-[#0f2422] rtl:text-[16px]">{label}</span>
          {help && (
            <small id={`${fieldId}-help`} className="font-sans text-[12.5px] leading-[1.45] text-[#6b7f7d] rtl:text-[14.5px]">
              {help}
            </small>
          )}
        </span>
      </label>
      {error && (
        <p id={`${fieldId}-error`} role="alert" className={cx(errorClass, "ms-8")}>
          {error}
        </p>
      )}
    </div>
  );
}
