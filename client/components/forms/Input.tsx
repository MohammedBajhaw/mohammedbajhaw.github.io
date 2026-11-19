"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { controlClass, cx, focusRing, type ControlSize, type Tone } from "./styles";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  FieldMeta & {
    tone?: Tone;
    size?: ControlSize;
    /** An icon or short text inside the start edge (a search glass, a currency sign). */
    leading?: ReactNode;
    /** Something inside the end edge (a unit, a clear button). */
    trailing?: ReactNode;
    /** Password fields get a show/hide button; these are its accessible names. */
    revealLabels?: { show: string; hide: string };
  };

/** A single-line field: text, email, number, url, search, password... with its label and messages. */
export function Input({
  label,
  help,
  error,
  labelStyle,
  wide,
  wrapperClassName,
  tone = "soft",
  size = "md",
  leading,
  trailing,
  revealLabels = { show: "Show password", hide: "Hide password" },
  id,
  type = "text",
  required,
  className,
  ...rest
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <FormField id={fieldId} label={label} help={help} error={error} required={required} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <div className="relative">
        {leading && <span className="pointer-events-none absolute start-4 top-1/2 grid -translate-y-1/2 place-items-center text-[#6b7f7d]">{leading}</span>}
        <input
          id={fieldId}
          type={isPassword && revealed ? "text" : type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, help, error)}
          className={cx(controlClass({ tone, size, invalid: Boolean(error) }), Boolean(leading) && "ps-11", (Boolean(trailing) || isPassword) && "pe-12", className)}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? revealLabels.hide : revealLabels.show}
            aria-pressed={revealed}
            className={cx("absolute end-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent p-0 text-[#6b7f7d] cursor-pointer hover:text-teal", focusRing)}
          >
            {revealed ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        ) : (
          trailing && <span className="absolute end-3 top-1/2 grid -translate-y-1/2 place-items-center text-[#6b7f7d]">{trailing}</span>
        )}
      </div>
    </FormField>
  );
}
