import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mohammed Bajhaw | Mechatronics Engineering Portfolio",
  description: "Academic and professional portfolio for Mohammed Bajhaw, focused on robotics, autonomous systems, and embedded engineering.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
