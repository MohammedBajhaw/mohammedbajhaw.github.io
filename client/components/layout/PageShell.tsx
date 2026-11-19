import type { ReactNode } from "react";
import type { Profile } from "@/lib/types";
import { Navbar } from "./Navbar";
import { SiteFooter } from "./SiteFooter";

type PageShellProps = {
  profile?: Profile | null;
  mainClassName?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  children: ReactNode;
};

export function PageShell({
  profile,
  mainClassName,
  includeHeader = true,
  includeFooter = true,
  children,
}: PageShellProps) {
  return (
    <>
      {includeHeader && <Navbar name={profile?.name} />}
      <main className={`relative z-10 bg-paper ${mainClassName ?? ""}`.trim()}>{children}</main>
      {includeFooter && (
        <div className="md:sticky md:bottom-0 z-0">
          <SiteFooter profile={profile} />
        </div>
      )}
    </>
  );
}
