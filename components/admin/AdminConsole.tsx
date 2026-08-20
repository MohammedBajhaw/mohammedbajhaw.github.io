"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type TabKey = "profiles" | "education" | "publications" | "experiences" | "skills" | "projects" | "project_media" | "section_icons" | "service_areas" | "services";
type ContentRow = Record<string, unknown>;

const tabs: { key: TabKey; label: string; template: ContentRow; order?: string }[] = [
  { key: "profiles", label: "Profile", template: { name: "", professional_title: "", location: "", email: "", linkedin_url: "", phone: "", bio: "", photo_path: null, photo_alt: null } },
  { key: "education", label: "Education", template: { institution: "", degree: "", field: "", location: "", start_year: "", end_year: "", description: "", sort_order: 0 }, order: "sort_order" },
  { key: "publications", label: "Publications", template: { title: "", venue: "", publication_date: "", status: "", authors: "", summary: "", details: "", keywords: [], url: "", sort_order: 0 }, order: "sort_order" },
  { key: "experiences", label: "Experience", template: { role: "", organization: "", location: "", start_date: "", end_date: "", is_current: false, summary: "", highlights: [], sort_order: 0 }, order: "sort_order" },
  { key: "skills", label: "Skills", template: { label: "", category: "", icon: "", sort_order: 0 }, order: "sort_order" },
  { key: "projects", label: "Projects", template: { slug: "", title: "", subtitle: "", summary: "", description: "", status: "", start_date: "", end_date: "", tags: [], tools: [], outcomes: [], featured: false, sort_order: 0 }, order: "sort_order" },
  { key: "project_media", label: "Project media", template: { project_id: 0, storage_path: "", alt: "", sort_order: 0 }, order: "sort_order" },
  { key: "section_icons", label: "Section icons", template: { section_key: "", label: "", storage_path: "", alt: "", sort_order: 0 }, order: "sort_order" },
  { key: "service_areas", label: "Service areas", template: { title: "", description: "", accent: "teal", icon: "robotics", sort_order: 0 }, order: "sort_order" },
  { key: "services", label: "Services", template: { area_id: 0, title: "", summary: "", deliverables: [], sort_order: 0 }, order: "sort_order" },
];

function cleanRecord(record: ContentRow) {
  const next = { ...record };
  delete next.created_at;
  delete next.updated_at;
  return next;
}

export function AdminConsole() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState<TabKey>("profiles");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [selected, setSelected] = useState<ContentRow | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [uploadPath, setUploadPath] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ContentRow | null>(null);

  const tab = tabs.find((item) => item.key === active)!;

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setIsAdmin(false); setSessionReady(true); return; }
    const { data, error: rpcError } = await supabase.rpc("is_portfolio_admin");
    setIsAdmin(Boolean(data) && !rpcError);
    setSessionReady(true);
  }, [supabase]);

  const refreshRows = useCallback(async () => {
    if (!isAdmin) return;
    setError("");
    let query = (supabase.from(active as never) as any).select("*");
    query = query.order(tab.order ?? "id", { ascending: true });
    const { data, error: queryError } = await query;
    if (queryError) { setError(queryError.message); return; }
    setRows((data ?? []) as ContentRow[]);
  }, [active, isAdmin, supabase, tab.order]);

  useEffect(() => {
    refreshSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => refreshSession());
    return () => listener.subscription.unsubscribe();
  }, [refreshSession, supabase]);

  useEffect(() => { refreshRows(); }, [refreshRows]);

  function startNew() {
    const template = { ...tab.template };
    setSelected(null);
    setDraft(JSON.stringify(template, null, 2));
    setNotice("Complete the JSON fields, then save the new record.");
  }

  function selectRow(row: ContentRow) {
    setSelected(row);
    setDraft(JSON.stringify(cleanRecord(row), null, 2));
    setNotice("");
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setError(""); setNotice("");
    const action = signUpMode ? supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } }) : supabase.auth.signInWithPassword({ email, password });
    const { data, error: authError } = await action;
    if (authError) { setError(authError.message); return; }
    if (signUpMode && !data.session) setNotice("Check your email to confirm the new account, then return to sign in.");
    else setNotice("Signed in. Checking your administrator permission.");
  }

  async function saveDraft() {
    try {
      setError(""); setNotice("");
      const payload = JSON.parse(draft) as ContentRow;
      const id = payload.id;
      if (id) {
        const { error: updateError } = await (supabase.from(active as never) as any).update(cleanRecord(payload)).eq("id", id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await (supabase.from(active as never) as any).insert(cleanRecord(payload));
        if (insertError) throw insertError;
      }
      setNotice("Saved to Supabase.");
      await refreshRows();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "The JSON record could not be saved."); }
  }

  async function deleteRow() {
    if (!confirmDelete?.id) return;
    const { error: deleteError } = await (supabase.from(active as never) as any).delete().eq("id", confirmDelete.id as number);
    if (deleteError) setError(deleteError.message);
    else { setNotice("Record deleted."); setDraft(""); setSelected(null); await refreshRows(); }
    setConfirmDelete(null);
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(""); setNotice("");
    const path = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) { setError(uploadError.message); return; }
    setUploadPath(path);
    setNotice("Upload complete. Copy the storage path into photo_path or storage_path in the selected record.");
  }

  async function removeLatestUpload() {
    if (!uploadPath) return;
    const { error: removeError } = await supabase.storage.from("portfolio-media").remove([uploadPath]);
    if (removeError) { setError(removeError.message); return; }
    setUploadPath("");
    setNotice("The unlinked upload was removed from Supabase Storage.");
  }

  if (!sessionReady) return <main className="admin-shell"><p className="eyebrow">Loading administration</p></main>;
  if (!isAdmin) return <main className="admin-shell"><Link className="admin-brand" href="/">Mohammed Bajhaw</Link><section className="auth-card"><p className="eyebrow">Portfolio administration</p><h1>{signUpMode ? "Create an administrator account" : "Sign in to manage content"}</h1><p>Authentication is handled by Supabase. The first account must be approved as administrator before it can edit portfolio data.</p><form onSubmit={submitAuth}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label><button className="button primary" type="submit">{signUpMode ? "Create account" : "Sign in"}</button></form><button className="text-button" onClick={() => setSignUpMode(!signUpMode)}>{signUpMode ? "I already have an account" : "Create a new account"}</button>{notice && <p className="status-note">{notice}</p>}{error && <p className="error-note">{error}</p>}</section></main>;

  return <main className="admin-shell"><header className="admin-topbar"><Link className="admin-brand" href="/">Mohammed Bajhaw <span>/ Admin</span></Link><button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button></header><div className="admin-layout"><aside className="admin-sidebar"><p className="eyebrow">Content types</p>{tabs.map((item) => <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => { setActive(item.key); setDraft(""); setSelected(null); }}>{item.label}</button>)}</aside><section className="admin-content"><div className="admin-title"><div><p className="eyebrow">Supabase content management</p><h1>{tab.label}</h1></div><button className="button primary" onClick={startNew}>New record</button></div><div className="admin-workspace"><div className="admin-list">{rows.map((row) => <button className={selected?.id === row.id ? "selected" : ""} key={String(row.id)} onClick={() => selectRow(row)}><strong>{String(row.title ?? row.name ?? row.label ?? row.role ?? row.institution ?? row.id)}</strong><span>ID {String(row.id)}</span></button>)}{rows.length === 0 && <p className="empty-note">No records. Create the first one.</p>}</div><div className="editor-panel"><p className="eyebrow">JSON editor</p><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Choose a record or create a new one." spellCheck={false} /><div className="editor-actions"><button className="button primary" onClick={saveDraft} disabled={!draft}>Save record</button>{selected && <button className="button danger" onClick={() => setConfirmDelete(selected)}>Delete</button>}</div><div className="uploader"><label className="upload-label">Upload profile or project media<input type="file" accept="image/*,.pdf" onChange={uploadFile} /></label>{uploadPath && <><code>{uploadPath}</code><button className="text-button" onClick={removeLatestUpload}>Remove unlinked upload</button></>}</div>{notice && <p className="status-note">{notice}</p>}{error && <p className="error-note">{error}</p>}</div></div></section></div>{confirmDelete && <div className="delete-backdrop" role="dialog" aria-modal="true"><section><p className="eyebrow">Confirm deletion</p><h2>Delete this record?</h2><p>This removes the selected database record. Associated rows may also be removed when a database relation requires it.</p><div className="editor-actions"><button className="button danger" onClick={deleteRow}>Delete record</button><button className="button" onClick={() => setConfirmDelete(null)}>Cancel</button></div></section></div>}</main>;
}
