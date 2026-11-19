import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Lexend } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "@/styles/globals.css";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALES, LOCALE_META, dirOf, isLocale, localePath } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { alternateLanguages } from "@/lib/seo";
import { fetchMaintenanceStatus } from "@/lib/services/source.api";
import { SITE_URL } from "@/lib/site";

// Fonts are downloaded at build time and served from the site itself: no request to Google, no layout shift.
const lexend = Lexend({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-lexend" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-plex-mono" });
// Arabic fonts live in public/fonts: SF Mada Bold for headings, JH Naskh Medium for body text.
// Only Arabic characters use these two fonts (the unicode-range below); Latin text (English, Turkish) stays in Lexend.
const arabicHeading = localFont({ src: "../../public/fonts/sf-mada-bold.ttf", weight: "700", style: "normal", display: "swap", variable: "--font-arabic-heading", preload: false, adjustFontFallback: false, declarations: [{ prop: "unicode-range", value: "U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+060C,U+061B,U+061F" }] });
const arabicBody = localFont({ src: "../../public/fonts/jh-naskh-expanded-medium.otf", weight: "500", style: "normal", display: "swap", variable: "--font-arabic-body", preload: false, adjustFontFallback: false, declarations: [{ prop: "size-adjust", value: "150%" }, { prop: "unicode-range", value: "U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+060C,U+061B,U+061F" }] });

/** Static pages are rebuilt in the background at most once an hour, so backend changes show up without a redeploy. */
export const revalidate = 3600;

type LayoutParams = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const m = await getMessages(lang);
  const { siteName, siteTitle, siteDescription, keywords } = m.meta;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: siteTitle, template: `%s | ${siteName}` },
    description: siteDescription,
    applicationName: siteName,
    keywords,
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    formatDetection: { telephone: false, email: false, address: false },
    alternates: { canonical: localePath(lang), languages: alternateLanguages("/") },
    openGraph: { type: "website", siteName, locale: LOCALE_META[lang].ogLocale, url: localePath(lang), title: siteTitle, description: siteDescription },
    twitter: { card: "summary", title: siteTitle, description: siteDescription },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

export const viewport: Viewport = { themeColor: "#0c4545", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children, params }: { children: ReactNode } & LayoutParams) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [messages, maintenance] = await Promise.all([getMessages(lang), fetchMaintenanceStatus()]);

  const localizedMaint = lang === "ar" ? maintenance?.translations?.ar : lang === "tr" ? maintenance?.translations?.tr : undefined;
  const maintTitle = localizedMaint?.title?.trim() || maintenance?.title || "Scheduled Maintenance";
  const maintMessage = localizedMaint?.message?.trim() || maintenance?.message || "";

  return (
    <html lang={lang} dir={dirOf(lang)} className={`${lexend.variable} ${plexMono.variable} ${arabicHeading.variable} ${arabicBody.variable}`}>
      <body>
        <I18nProvider locale={lang} messages={messages}>
          {maintenance?.enabled ? (
            <main className="min-h-screen flex items-center justify-center bg-[#0c4545] text-[#f5fbfa] px-6 py-16">
              <div className="max-w-xl w-full rounded-[36px] bg-[#083535] p-10 md:p-14 text-center shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#8dd8cb] mb-4">
                  503 · Maintenance
                </p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                  {maintTitle}
                </h1>
                <p className="text-base md:text-lg leading-relaxed text-[#cfe7e3] mb-6">
                  {maintMessage}
                </p>
                {maintenance.estimatedReturnAt ? (
                  <p className="font-mono text-xs text-[#8dd8cb]">
                    ETA: {maintenance.estimatedReturnAt}
                  </p>
                ) : null}
              </div>
            </main>
          ) : (
            children
          )}
        </I18nProvider>
      </body>
    </html>
  );
}
