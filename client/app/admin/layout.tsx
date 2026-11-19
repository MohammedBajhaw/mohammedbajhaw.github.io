import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Lexend } from "next/font/google";
import localFont from "next/font/local";
import "@/styles/globals.css";

// The studio is its own root layout (English, never indexed). It carries the same fonts as the public site so Arabic fields render properly.
const lexend = Lexend({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700", "800"], display: "swap", variable: "--font-lexend" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-plex-mono" });
const arabicHeading = localFont({ src: "../../public/fonts/sf-mada-bold.ttf", weight: "700", style: "normal", display: "swap", variable: "--font-arabic-heading", preload: false, adjustFontFallback: false, declarations: [{ prop: "unicode-range", value: "U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+060C,U+061B,U+061F" }] });
const arabicBody = localFont({ src: "../../public/fonts/jh-naskh-expanded-medium.otf", weight: "500", style: "normal", display: "swap", variable: "--font-arabic-body", preload: false, adjustFontFallback: false, declarations: [{ prop: "size-adjust", value: "150%" }, { prop: "unicode-range", value: "U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F,U+060C,U+061B,U+061F" }] });

export const metadata: Metadata = {
  title: "Content studio",
  description: "Portfolio administration.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0b2220", width: "device-width", initialScale: 1 };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${lexend.variable} ${plexMono.variable} ${arabicHeading.variable} ${arabicBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
