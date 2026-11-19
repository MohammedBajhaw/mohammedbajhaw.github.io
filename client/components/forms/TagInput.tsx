"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { FormField, describedBy, type FieldMeta } from "./FormField";
import { cx, type Tone } from "./styles";

type TagInputProps = FieldMeta & {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  tone?: Tone;
  /** Stop adding at this many tags. */
  max?: number;
  id?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
  removeLabel?: (tag: string) => string;
};

/**
 * A list of short items typed one by one. Enter or a comma adds the text, Backspace on an empty box removes the last one,
 * and pasting "a, b, c" adds three. Use it for tags, keywords and tools.
 */
export function TagInput({ label, help, error, labelStyle, wide, wrapperClassName, value, onChange, placeholder, tone = "soft", max, id, required, dir, removeLabel = (tag) => `Remove ${tag}` }: TagInputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const incoming = raw.split(",").map((item) => item.trim()).filter(Boolean);
    if (!incoming.length) return;
    const next = [...value];
    for (const tag of incoming) if (!next.some((existing) => existing.toLowerCase() === tag.toLowerCase()) && (max === undefined || next.length < max)) next.push(tag);
    onChange(next);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <FormField id={fieldId} label={label} help={help} error={error} required={required} labelStyle={labelStyle} wide={wide} wrapperClassName={wrapperClassName}>
      <div
        className={cx(
          "flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-[16px] px-3 py-2 transition-shadow duration-150",
          tone === "soft" ? "bg-[#f4f8f7]" : "bg-white",
          error ? "shadow-[0_0_0_2px_#c0392b]" : "focus-within:shadow-[0_0_0_2px_#176b69]",
        )}
        dir={dir}
      >
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-[12px] bg-[#e1efec] py-1 ps-3 pe-1 font-sans text-[13.5px] font-semibold text-[#0c4545]">
            {tag}
            <button type="button" aria-label={removeLabel(tag)} onClick={() => onChange(value.filter((item) => item !== tag))} className="grid size-6 place-items-center rounded-full border-0 bg-transparent p-0 text-[#41605b] cursor-pointer hover:bg-[#cfe4e0]">
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id={fieldId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          onPaste={(event) => {
            const text = event.clipboardData.getData("text");
            if (text.includes(",")) {
              event.preventDefault();
              add(text);
            }
          }}
          disabled={max !== undefined && value.length >= max}
          placeholder={value.length ? "" : placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, help, error)}
          className="min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 font-sans text-[15px] text-[#0f2422] outline-none placeholder:text-[#8aa19d] rtl:text-[17px]"
        />
      </div>
    </FormField>
  );
}
