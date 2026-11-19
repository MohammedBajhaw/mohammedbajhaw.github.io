"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CloudUpload, Download, KeyRound, Save, XCircle } from "lucide-react";
import { ApiError, backupApi, type BackupDestinationType, type BackupSettings } from "@/lib/admin/api";
import { Checkbox, FormButton, FormMessage, Input, Select } from "@/components/forms";
import { Card, Eyebrow, Spinner, StatusToast } from "./ui";

type Form = {
  destinationType: BackupDestinationType;
  targetUrl: string;
  authHeaderName: string;
  authSecret: string;
  driveFolderId: string;
  includeContactMessages: boolean;
};

const DESTINATIONS: { value: BackupDestinationType; label: string }[] = [
  { value: "webhook", label: "Custom HTTP / Webhook / Cloud Endpoint (JSON POST)" },
  { value: "google_drive", label: "Google Drive API (Multipart JSON Upload)" },
];

const toForm = (s: BackupSettings): Form => ({
  destinationType: s.destinationType,
  targetUrl: s.targetUrl,
  authHeaderName: s.authHeaderName || "Authorization",
  authSecret: "",
  driveFolderId: s.driveFolderId,
  includeContactMessages: s.includeContactMessages,
});

function formatBytes(bytes?: number): string {
  if (bytes === undefined) return "–";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** One-click JSON backups: download locally or push directly to a configured external platform (e.g. Google Drive or a custom webhook). */
export function BackupManager() {
  const [saved, setSaved] = useState<BackupSettings | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [baseline, setBaseline] = useState("");
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [runningRemote, setRunningRemote] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    backupApi
      .settings()
      .then((data) => {
        if (!active) return;
        const next = toForm(data);
        setSaved(data);
        setForm(next);
        setBaseline(JSON.stringify(next));
      })
      .catch((failure: unknown) => {
        if (active) setLoadError(failure instanceof ApiError ? failure.readable : "Could not load backup settings.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const dirty = form !== null && JSON.stringify(form) !== baseline;

  const patch = (change: Partial<Form>, key?: string) => {
    if (key) setErrors((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== key)));
    setForm((current) => (current ? { ...current, ...change } : current));
  };

  async function save() {
    if (!form) return;
    const problems: Record<string, string> = {};
    if (form.destinationType === "webhook" && form.targetUrl.trim()) {
      if (!/^https:\/\//i.test(form.targetUrl.trim()) && !/^http:\/\/(localhost|127\.0\.0\.1)/i.test(form.targetUrl.trim())) {
        problems.targetUrl = "The destination URL must start with https:// (http:// only for localhost).";
      }
    }
    if (form.authHeaderName.trim() && !/^[a-zA-Z0-9-]+$/.test(form.authHeaderName.trim())) {
      problems.authHeaderName = "Header name may only contain letters, digits, and hyphens.";
    }
    if (Object.keys(problems).length) {
      setErrors(problems);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    setErrors({});
    try {
      const reply = await backupApi.update({
        destinationType: form.destinationType,
        targetUrl: form.targetUrl.trim(),
        authHeaderName: form.authHeaderName.trim() || "Authorization",
        ...(form.authSecret.trim() ? { authSecret: form.authSecret.trim() } : {}),
        driveFolderId: form.driveFolderId.trim(),
        includeContactMessages: form.includeContactMessages,
      });
      const next = toForm(reply);
      setSaved(reply);
      setForm(next);
      setBaseline(JSON.stringify(next));
      setNotice("Backup settings saved.");
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Saving failed.");
    } finally {
      setSaving(false);
    }
  }

  async function runRemoteBackup() {
    if (runningRemote) return;
    setRunningRemote(true);
    setError("");
    setNotice("");
    try {
      const result = await backupApi.runRemote();
      setNotice(`${result.message} (${formatBytes(result.sizeBytes)})`);
      const refreshed = await backupApi.settings().catch(() => null);
      if (refreshed) setSaved(refreshed);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Remote backup failed.");
      const refreshed = await backupApi.settings().catch(() => null);
      if (refreshed) setSaved(refreshed);
    } finally {
      setRunningRemote(false);
    }
  }

  async function downloadJson() {
    if (downloading) return;
    setDownloading(true);
    setError("");
    setNotice("");
    try {
      const snapshot = await backupApi.exportSnapshot();
      const jsonBlob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json;charset=utf-8" });
      const blobUrl = URL.createObjectURL(jsonBlob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = snapshot.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      setNotice(`Downloaded ${snapshot.filename}`);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.readable : "Could not export backup JSON.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:gap-6">
      <header>
        <Eyebrow>Platform</Eyebrow>
        <h1 className="m-0 mt-2 font-sans text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0f2422]">Backups</h1>
        <p className="m-0 mt-2 max-w-[640px] font-sans text-[14.5px] leading-[1.65] text-[#526563]">
          Generate a full JSON snapshot of your portfolio database on click — download it locally or upload it straight to Google Drive or any external webhook.
        </p>
      </header>

      {loadError && <FormMessage tone="error">{loadError}</FormMessage>}
      {!form && !loadError && <Spinner label="Loading backup settings" />}

      {form && saved && (
        <>
          <Card className="grid gap-4">
            <Eyebrow>On-click backup</Eyebrow>
            <div className="flex flex-wrap items-center gap-3">
              <FormButton
                busy={runningRemote}
                disabled={dirty}
                icon={<CloudUpload size={16} aria-hidden="true" />}
                onClick={() => void runRemoteBackup()}
              >
                {runningRemote ? "Uploading backup…" : "Backup now to destination"}
              </FormButton>
              <FormButton
                variant="soft"
                busy={downloading}
                icon={<Download size={16} aria-hidden="true" />}
                onClick={() => void downloadJson()}
              >
                {downloading ? "Preparing JSON…" : "Download JSON snapshot"}
              </FormButton>
              {dirty && (
                <span className="font-sans text-[12.5px] font-semibold text-[#b0651d]">
                  Save your destination settings first before running remote backup.
                </span>
              )}
            </div>

            {saved.lastBackupAt && (
              <div className="flex flex-wrap items-center gap-2 rounded-[20px] bg-[#f4f8f7] px-4 py-3 font-sans text-[13.5px]">
                {saved.lastBackupStatus === "success" ? (
                  <CheckCircle2 size={16} className="shrink-0 text-[#0c6b58]" aria-hidden="true" />
                ) : (
                  <XCircle size={16} className="shrink-0 text-[#b42318]" aria-hidden="true" />
                )}
                <span className="font-semibold text-[#0f2422]">
                  Last run: {new Date(saved.lastBackupAt).toLocaleString()} · {formatBytes(saved.lastBackupSizeBytes)}
                </span>
                {saved.lastBackupMessage && (
                  <span className={saved.lastBackupStatus === "error" ? "text-[#b42318]" : "text-[#526563]"}>
                    — {saved.lastBackupMessage}
                  </span>
                )}
              </div>
            )}
          </Card>

          <Card className="grid gap-5">
            <Eyebrow>Destination platform</Eyebrow>
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <Select
                label="Destination type"
                wide
                value={form.destinationType}
                onChange={(event) => patch({ destinationType: event.target.value as BackupDestinationType })}
                options={DESTINATIONS}
              />

              {form.destinationType === "webhook" ? (
                <>
                  <Input
                    id="bk-url"
                    label="Destination URL"
                    wide
                    error={errors.targetUrl}
                    value={form.targetUrl}
                    onChange={(event) => patch({ targetUrl: event.target.value }, "targetUrl")}
                    placeholder="https://script.google.com/macros/s/.../exec or https://your-cloud.example/backup"
                    help="Receives the full backup via HTTP POST with Content-Type: application/json."
                  />
                  <Input
                    id="bk-header"
                    label="Auth header name"
                    error={errors.authHeaderName}
                    value={form.authHeaderName}
                    onChange={(event) => patch({ authHeaderName: event.target.value }, "authHeaderName")}
                    placeholder="Authorization"
                  />
                  <Input
                    label="Auth header value / secret"
                    type="password"
                    autoComplete="off"
                    leading={<KeyRound size={16} aria-hidden="true" />}
                    value={form.authSecret}
                    onChange={(event) => patch({ authSecret: event.target.value })}
                    placeholder={saved.hasSecret ? `Saved (${saved.secretMasked ?? "hidden"}) — type to replace` : "Optional Bearer token or API secret"}
                  />
                </>
              ) : (
                <>
                  <Input
                    id="bk-folder"
                    label="Google Drive Folder ID (optional)"
                    value={form.driveFolderId}
                    onChange={(event) => patch({ driveFolderId: event.target.value })}
                    placeholder="Leave empty to upload to My Drive root"
                  />
                  <Input
                    label="Google Drive OAuth Access Token"
                    type="password"
                    autoComplete="off"
                    leading={<KeyRound size={16} aria-hidden="true" />}
                    value={form.authSecret}
                    onChange={(event) => patch({ authSecret: event.target.value })}
                    placeholder={saved.hasSecret ? `Saved (${saved.secretMasked ?? "hidden"}) — type to replace` : "Paste OAuth2 Bearer access token"}
                    help="Uploads multipart/related JSON directly to Google Drive v3 files API."
                  />
                </>
              )}
            </div>

            <Checkbox
              checked={form.includeContactMessages}
              onChange={(includeContactMessages) => patch({ includeContactMessages })}
              label="Include visitor contact messages in backup JSON"
            />
          </Card>

          <div className="sticky bottom-4 z-10 inline-flex w-fit justify-self-start flex-wrap items-center gap-3 rounded-full bg-white/90 p-2 shadow-[0_14px_36px_rgba(16,41,39,0.14)] backdrop-blur-md">
            <FormButton busy={saving} disabled={!dirty} icon={<Save size={16} aria-hidden="true" />} onClick={() => void save()}>
              {saving ? "Saving…" : "Save backup settings"}
            </FormButton>
            {dirty && <span className="pr-2 font-sans text-[12.5px] font-bold text-[#b0651d]">Unsaved changes</span>}
          </div>

          <StatusToast error={error} notice={notice} />
        </>
      )}
    </div>
  );
}
