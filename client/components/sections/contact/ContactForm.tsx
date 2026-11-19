"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Input, Select, Textarea } from "@/components/forms";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/lib/i18n/client";
import { ClientInputValidationError, sanitizeAndValidatePayload } from "@/lib/security/sanitize";

const TOPIC_KEYS = ["topicCollaboration", "topicConsulting", "topicProject", "topicOther"] as const;

/**
 * Submits the visitor message to the backend API (`POST /api/profile/contact`) via Next.js `/api` rewrite.
 */
export function ContactForm({ email: _email }: { email: string }) {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const from = String(data.get("email") ?? "").trim();
    const topic = t(`contact.${TOPIC_KEYS[Number(data.get("topic") ?? 0)] ?? TOPIC_KEYS[0]}`);
    const message = String(data.get("message") ?? "").trim();

    setSubmitting(true);
    setPrepared(false);
    setErrorMessage(null);

    try {
      const safePayload = sanitizeAndValidatePayload({
        name,
        email: from,
        subject: topic,
        message,
      });

      const response = await fetch("/api/profile/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(safePayload),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success: boolean; error?: { message?: string; details?: unknown } }
        | null;

      if (!response.ok || !payload?.success) {
        const details = Array.isArray(payload?.error?.details)
          ? payload.error.details.map(String).join(" · ")
          : "";
        setErrorMessage(
          details
            ? `${payload?.error?.message ?? "Validation failed."} (${details})`
            : (payload?.error?.message ?? "Failed to send your message. Please try again."),
        );
        return;
      }

      form.reset();
      setPrepared(true);
    } catch (error) {
      if (error instanceof ClientInputValidationError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to reach the server. Please try again shortly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-5" aria-label={t("a11y.contactForm")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input id="contact-name" name="name" label={t("contact.name")} labelStyle="eyebrow" tone="white" required autoComplete="name" placeholder={t("contact.namePlaceholder")} />
        <Input id="contact-email" name="email" label={t("contact.yourEmail")} labelStyle="eyebrow" tone="white" type="email" required autoComplete="email" placeholder={t("contact.emailPlaceholder")} dir="ltr" />
      </div>

      <Select
        id="contact-topic"
        name="topic"
        label={t("contact.topic")}
        labelStyle="eyebrow"
        tone="white"
        defaultValue={0}
        options={TOPIC_KEYS.map((key, index) => ({ value: index, label: t(`contact.${key}`) }))}
      />

      <Textarea id="contact-message" name="message" label={t("contact.message")} labelStyle="eyebrow" tone="white" required rows={6} placeholder={t("contact.messagePlaceholder")} className="min-h-[140px]" />

      {errorMessage ? (
        <p className="m-0 rounded-[16px] bg-[#fbeeee] px-4 py-3 font-sans text-[13.5px] font-medium text-[#a32a2a] rtl:text-[15.5px]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {prepared ? (
        <p className="m-0 flex items-center gap-2.5 rounded-[16px] bg-[#e5f3ef] px-4 py-3 font-sans text-[13.5px] font-semibold text-[#0c4545] rtl:text-[15.5px]" role="status">
          <CheckCircle2 size={18} className="shrink-0 text-[#0c6b58]" aria-hidden="true" />
          <span>{t("contact.hintDone")}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit" disabled={submitting} className="h-[46px] px-7 text-[13px] rtl:text-[16px]">
          <span>{submitting ? "..." : t("contact.submit")}</span>
          <Send size={14} className="text-[#c5efe8] rtl:-scale-x-100" aria-hidden="true" />
        </Button>
        {!prepared ? (
          <p className="m-0 font-sans text-[12.5px] leading-[1.6] text-[#637876] rtl:text-[15.5px]" aria-live="polite">
            {t("contact.hintIdle")}
          </p>
        ) : null}
      </div>
    </form>
  );
}

export function ContactFormSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="grid gap-2">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-[46px] w-full rounded-[18px]" />
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-3 w-14 rounded-full" />
        <Skeleton className="h-[46px] w-full rounded-[18px]" />
      </div>
      <div className="grid gap-2">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-[140px] w-full rounded-[18px]" />
      </div>
      <Skeleton className="h-[46px] w-44 rounded-full" />
    </div>
  );
}
