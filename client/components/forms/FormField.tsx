import type { ReactNode } from "react";
import { cx, errorClass, helpClass, labelClass, type LabelStyle } from "./styles";

export type FieldMeta = {
  /** Visible label. Leave it out only when the control is labelled some other way (aria-label). */
  label?: string;
  help?: string;
  /** A validation message. It replaces the help text, is announced to screen readers and turns the field red. */
  error?: string;
  labelStyle?: LabelStyle;
  /** Spans both columns of a two-column form grid. */
  wide?: boolean;
  /** Extra classes for the wrapper around label, control and message. */
  wrapperClassName?: string;
};

type FormFieldProps = FieldMeta & { id: string; required?: boolean; children: ReactNode };

/** The `aria-describedby` value that points a control at its help or error text. */
export const describedBy = (id: string, help?: string, error?: string) => (error ? `${id}-error` : help ? `${id}-help` : undefined);

/**
 * Label, control and message in one block. Every ready-made control wraps itself in this, and it can also wrap a custom
 * control: pass the same `id` to the control and use `describedBy` for its `aria-describedby`.
 */
export function FormField({ id, label, help, error, required, labelStyle, wide, wrapperClassName, children }: FormFieldProps) {
  return (
    <div className={cx(wide && "sm:col-span-2", wrapperClassName)}>
      {label && (
        <label htmlFor={id} className={labelClass(labelStyle)}>
          {label}
          {required ? " *" : ""}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className={helpClass}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
