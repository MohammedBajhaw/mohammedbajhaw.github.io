"use client";

import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { FormButton, FormMessage } from "@/components/forms";

/**
 * Layout pieces specific to the studio (cards, headings, dialogs). Everything you type into or press in a form
 * comes from components/forms, so the studio and the public site share one set of controls.
 */

export function IconButton({ label, className = "", children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid w-10 h-10 place-items-center rounded-full border-0 bg-transparent p-0 text-[#41605b] cursor-pointer transition-colors duration-150 hover:bg-[#e5efed] hover:text-[#0c4545] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-teal ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] sm:rounded-[34px] bg-white p-5 sm:p-7 shadow-[0_4px_24px_rgba(16,41,39,0.05)] ${className}`.trim()}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mono-eyebrow m-0">{children}</p>;
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2.5 py-10 font-sans text-[14px] text-[#526563]">
      <LoaderCircle size={18} className="animate-spin text-teal" aria-hidden="true" />
      {label}
    </div>
  );
}

/** Native modal dialog: traps focus, closes on Escape, and returns focus to the button that opened it. */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  icon,
  onConfirm,
  onCancel,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === ref.current) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(92vw,440px)] rounded-[28px] border-0 bg-white p-7 text-ink shadow-[0_30px_80px_rgba(8,27,26,0.35)] backdrop:bg-[#081b1a]/60"
    >
      <span className="grid w-11 h-11 place-items-center rounded-full bg-[#fbeeee] text-[#a32a2a]">
        {icon ?? <Trash2 size={20} aria-hidden="true" />}
      </span>
      <h2 id="confirm-title" className="m-0 mt-4 font-sans text-[20px] font-bold leading-[1.3] tracking-[-0.02em]">
        {title}
      </h2>
      <p className="m-0 mt-2 font-sans text-[14.5px] leading-[1.65] text-[#526563]">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <FormButton variant="danger" busy={busy} onClick={onConfirm}>
          {confirmLabel}
        </FormButton>
        <FormButton variant="ghost" onClick={() => ref.current?.close()}>
          Cancel
        </FormButton>
      </div>
    </dialog>
  );
}

/** Floating bottom-right notification toast for save, delete, and action feedback across the studio. */
export function StatusToast({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 grid w-[min(420px,calc(100vw-2rem))] gap-2">
      {error && (
        <FormMessage tone="error" className="shadow-[0_16px_40px_rgba(16,41,39,0.18)]">
          {error}
        </FormMessage>
      )}
      {notice && (
        <FormMessage tone="ok" className="shadow-[0_16px_40px_rgba(16,41,39,0.18)]">
          {notice}
        </FormMessage>
      )}
    </div>
  );
}
