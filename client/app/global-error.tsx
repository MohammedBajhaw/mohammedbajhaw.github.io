"use client";

import "@/styles/globals.css";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_LOCALE, dirOf, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Last-resort boundary that replaces the whole layout, so it cannot rely on the dictionaries or the
 * I18nProvider. The three languages are inlined here on purpose.
 */
const COPY: Record<
  Locale,
  { eyebrow: string; title: string; description: string; retry: string; home: string; reference: string }
> = {
  en: {
    eyebrow: "Temporary interruption",
    title: "We couldn’t load this page right now.",
    description:
      "An unexpected error interrupted loading the content. Try again in a moment or return to the home page.",
    retry: "Try again",
    home: "Back to home",
    reference: "Error reference",
  },
  ar: {
    eyebrow: "انقطاع مؤقت",
    title: "تعذّر تحميل هذه الصفحة الآن.",
    description:
      "حدث خطأ غير متوقع أثناء تحميل المحتوى. يمكنك إعادة المحاولة الآن أو العودة إلى الصفحة الرئيسية.",
    retry: "إعادة المحاولة",
    home: "العودة للرئيسية",
    reference: "مرجع الخطأ",
  },
  tr: {
    eyebrow: "Geçici kesinti",
    title: "Bu sayfa şu anda yüklenemedi.",
    description:
      "İçerik yüklenirken beklenmeyen bir hata oluştu. Kısa bir süre sonra tekrar deneyebilir veya ana sayfaya dönebilirsiniz.",
    retry: "Tekrar dene",
    home: "Ana sayfaya dön",
    reference: "Hata referansı",
  },
};

function currentLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const first = window.location.pathname.split("/")[1];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = currentLocale();
  const copy = COPY[locale];

  return (
    <html lang={locale} dir={dirOf(locale)}>
      <body className="bg-paper text-ink font-sans antialiased m-0">
        <main className="grid place-content-center min-h-screen max-w-[680px] px-6 py-12 mx-auto">
          <p className="mono-eyebrow m-0">{copy.eyebrow}</p>
          <h1 className="m-0 mt-4 font-sans font-extrabold text-[clamp(34px,5.6vw,58px)] leading-[1.04] tracking-[-0.045em] bg-linear-to-r rtl:bg-linear-to-l from-[#102927] via-[#176b69] to-[#2b8a87] pb-[0.14em] bg-clip-text text-transparent">
            {copy.title}
          </h1>
          <p className="m-0 mt-4 max-w-[540px] font-sans text-[15.5px] sm:text-[17px] leading-[1.7] text-[#4c5e5c] rtl:text-[18px]">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => reset()} className="h-[46px] px-6 text-[13.5px] rtl:text-[16px]">
              <RotateCcw size={15} className="text-[#c5efe8]" aria-hidden="true" />
              <span>{copy.retry}</span>
            </Button>
            <Button
              href={`/${locale}`}
              variant="glass"
              className="h-[46px] px-6 text-[13.5px] bg-[#e6f1ef]! text-[#0c4545]! hover:bg-[#d8e8e5]! rtl:text-[16px]"
            >
              <ArrowLeft size={15} className="rtl:rotate-180" aria-hidden="true" />
              <span>{copy.home}</span>
            </Button>
          </div>

          {error?.digest ? (
            <p className="m-0 mt-6 font-mono text-[12px] text-[#6d7f7d]">
              {copy.reference}: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
