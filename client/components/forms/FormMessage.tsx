import type { ReactNode } from "react";
import { Check, CircleAlert, Info } from "lucide-react";
import { cx } from "./styles";

const TONES = {
  ok: { box: "bg-[#e5f3ef] text-[#0c4545]", Icon: Check, role: "status" as const },
  error: { box: "bg-[#fbeeee] text-[#a32a2a]", Icon: CircleAlert, role: "alert" as const },
  info: { box: "bg-[#eaf1f6] text-[#234a63]", Icon: Info, role: "status" as const },
};

/** A message for the whole form (saved, failed, needs attention). Errors are announced at once; the others politely. */
export function FormMessage({ tone, children, className }: { tone: keyof typeof TONES; children: ReactNode; className?: string }) {
  const { box, Icon, role } = TONES[tone];
  return (
    <p role={role} className={cx("m-0 flex items-start gap-2.5 rounded-[18px] px-4 py-3 font-sans text-[14px] leading-[1.55] rtl:text-[16px]", box, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}
