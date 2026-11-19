import { Fragment } from "react";

/** Renders text where **double asterisks** mark bold runs (used by translated strings that embed numbers). */
export function RichText({ text, boldClassName = "font-extrabold text-[#102927]" }: { text: string; boldClassName?: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className={boldClassName}>
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
