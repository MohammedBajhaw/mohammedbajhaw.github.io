"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { authApi, resourceApi, setUnauthorizedHandler, type AdminSession } from "@/lib/admin/api";
import type { ViewKey } from "@/lib/admin/nav";
import { RESOURCES, resourceByKey, type ResourceKey } from "@/lib/admin/resources";
import { AdminNavbar } from "./AdminNavbar";
import { AuditLog } from "./AuditLog";
import { Dashboard } from "./Dashboard";
import { LoginScreen } from "./LoginScreen";
import { MessagesInbox } from "./MessagesInbox";
import { PlatformSettings } from "./PlatformSettings";
import { BackupManager } from "./BackupManager";
import { TranslationSettings } from "./TranslationSettings";
import { ResourceWorkspace } from "./ResourceWorkspace";
import { Spinner } from "./ui";

const VIEW_KEYS = new Set<string>(["dashboard", "messages", "activity", "settings", "translation", "backup", ...RESOURCES.map((resource) => resource.key)]);

/** The current screen lives in the URL hash (#projects), so the back button and bookmarks work without extra routes. */
function useHashView(): [ViewKey, (view: ViewKey) => void] {
  const hash = useSyncExternalStore(
    (notify) => {
      window.addEventListener("hashchange", notify);
      return () => window.removeEventListener("hashchange", notify);
    },
    () => window.location.hash.slice(1),
    () => "",
  );
  const view = (VIEW_KEYS.has(hash) ? hash : "dashboard") as ViewKey;
  const go = useCallback((next: ViewKey) => {
    window.location.hash = next;
    window.scrollTo({ top: 0 });
  }, []);
  return [view, go];
}

type Status = "checking" | "signedOut" | "signedIn";

export function AdminConsole() {
  const [status, setStatus] = useState<Status>("checking");
  const [session, setSession] = useState<AdminSession | null>(null);
  const [view, go] = useHashView();
  const [unread, setUnread] = useState(0);

  const refreshSession = useCallback(() => {
    authApi
      .me()
      .then((me) => {
        setSession(me);
        setStatus("signedIn");
      })
      .catch(() => setStatus("signedOut"));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setStatus("signedOut"));
    refreshSession();
    return () => setUnauthorizedHandler(null);
  }, [refreshSession]);

  useEffect(() => {
    if (status !== "signedIn") return;
    let active = true;
    resourceApi
      .page("/profile/contact", 1, 100)
      .then(({ data }) => {
        if (active) setUnread(data.filter((item) => item.status === "new").length);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [status]);

  function signOut() {
    authApi
      .logout()
      .catch(() => undefined)
      .finally(() => {
        setSession(null);
        setStatus("signedOut");
      });
  }

  if (status === "checking") {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#f2f6f5]">
        <Spinner label="Opening your content studio" />
      </main>
    );
  }

  if (status === "signedOut") return <LoginScreen onSignedIn={refreshSession} />;

  return (
    <div className="min-h-dvh bg-[#f2f6f5] text-ink">
      <AdminNavbar view={view} unread={unread} session={session} onGo={go} onSignOut={signOut} />
      <main className="shell pb-20 pt-28 sm:pt-36">
        {view === "dashboard" && <Dashboard onNavigate={go} />}
        {view === "messages" && <MessagesInbox onUnreadChange={setUnread} />}
        {view === "activity" && <AuditLog />}
        {view === "settings" && <PlatformSettings />}
        {view === "translation" && <TranslationSettings />}
        {view === "backup" && <BackupManager />}
        {RESOURCES.some((resource) => resource.key === view) && <ResourceWorkspace key={view} def={resourceByKey(view as ResourceKey)} />}
      </main>
    </div>
  );
}
