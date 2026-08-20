"use client";

import Link from "next/link";
import {
  Check,
  ChevronRight,
  FileText,
  FolderKanban,
  GraduationCap,
  ImageIcon,
  LayoutPanelLeft,
  LoaderCircle,
  Plus,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

type TabKey =
  | "profiles"
  | "education"
  | "publications"
  | "experiences"
  | "skills"
  | "projects"
  | "project_media"
  | "section_icons"
  | "service_areas"
  | "services";
type ContentRow = Record<string, unknown>;
type FieldKind = "text" | "textarea" | "number" | "toggle" | "array" | "select";

type FieldDefinition = {
  key: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  help?: string;
  nullable?: boolean;
  relation?: "projects" | "service_areas";
};

type TabDefinition = {
  key: TabKey;
  label: string;
  singular: string;
  group: string;
  icon: LucideIcon;
  template: ContentRow;
  fields: FieldDefinition[];
  order?: string;
  emptyMessage: string;
};

const tabs: TabDefinition[] = [
  {
    key: "profiles",
    label: "Profile",
    singular: "profile",
    group: "Portfolio foundation",
    icon: UserRound,
    template: { name: "", professional_title: "", location: "", email: "", linkedin_url: "", phone: "", bio: "", photo_path: null, photo_alt: null },
    fields: [
      { key: "name", label: "Full name", placeholder: "Mohammed Bajhaw" },
      { key: "professional_title", label: "Professional title", placeholder: "Mechatronics Engineer" },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye" },
      { key: "email", label: "Contact email", placeholder: "name@example.com" },
      { key: "linkedin_url", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/...", nullable: true },
      { key: "phone", label: "Phone number", placeholder: "+90...", nullable: true },
      { key: "bio", label: "Short introduction", kind: "textarea", placeholder: "A concise professional introduction for the home page." },
      { key: "photo_path", label: "Profile image path", placeholder: "Use the upload area below", nullable: true, help: "This field is filled automatically when you upload an image here." },
      { key: "photo_alt", label: "Image description", placeholder: "Portrait of Mohammed Bajhaw", nullable: true },
    ],
    emptyMessage: "Create your profile first. It is used across the public site.",
  },
  {
    key: "education",
    label: "Education",
    singular: "education entry",
    group: "Portfolio foundation",
    icon: GraduationCap,
    template: { institution: "", degree: "", field: "", location: "", start_year: "", end_year: "", description: "", sort_order: 0 },
    fields: [
      { key: "institution", label: "Institution", placeholder: "Fırat University" },
      { key: "degree", label: "Degree", placeholder: "Bachelor’s Degree" },
      { key: "field", label: "Field of study", placeholder: "Mechatronics Engineering" },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye" },
      { key: "start_year", label: "Start year", placeholder: "2021" },
      { key: "end_year", label: "End year", placeholder: "2026" },
      { key: "description", label: "Description", kind: "textarea", placeholder: "Optional context about the programme." },
      { key: "sort_order", label: "Display order", kind: "number", help: "Lower numbers appear first." },
    ],
    order: "sort_order",
    emptyMessage: "Add an education entry to show your academic background.",
  },
  {
    key: "publications",
    label: "Publications",
    singular: "publication",
    group: "Portfolio foundation",
    icon: FileText,
    template: { title: "", venue: "", publication_date: "", status: "", authors: "", summary: "", details: "", keywords: [], url: "", sort_order: 0 },
    fields: [
      { key: "title", label: "Publication title", kind: "textarea", placeholder: "Full research-paper title" },
      { key: "venue", label: "Conference or journal", placeholder: "IEEE Conference" },
      { key: "publication_date", label: "Publication date", placeholder: "2026" },
      { key: "status", label: "Status", placeholder: "Research paper" },
      { key: "authors", label: "Authors", placeholder: "Author One, Author Two" },
      { key: "summary", label: "Short summary", kind: "textarea", placeholder: "The concise description shown on the home page." },
      { key: "details", label: "Abstract and details", kind: "textarea", placeholder: "Full abstract and supporting publication details." },
      { key: "keywords", label: "Keywords", kind: "array", placeholder: "ROS 2, LiDAR, SLAM" },
      { key: "url", label: "PDF or publication URL", placeholder: "https://...", nullable: true },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Add a publication to create a research-detail page.",
  },
  {
    key: "experiences",
    label: "Experience",
    singular: "experience entry",
    group: "Portfolio foundation",
    icon: Wrench,
    template: { role: "", organization: "", location: "", start_date: "", end_date: "", is_current: false, summary: "", highlights: [], sort_order: 0 },
    fields: [
      { key: "role", label: "Role", placeholder: "Robotics Research Intern" },
      { key: "organization", label: "Organisation", placeholder: "RAI Laboratory" },
      { key: "location", label: "Location", placeholder: "Elazığ, Türkiye" },
      { key: "start_date", label: "Start date", placeholder: "Jul 2025" },
      { key: "end_date", label: "End date", placeholder: "Sep 2025", nullable: true },
      { key: "is_current", label: "Current role", kind: "toggle", help: "Turn this on for an ongoing position." },
      { key: "summary", label: "Summary", kind: "textarea", placeholder: "Describe the role and your contribution." },
      { key: "highlights", label: "Highlights", kind: "array", placeholder: "Hardware integration, Sensor validation" },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Add an experience entry to show professional and research work.",
  },
  {
    key: "skills",
    label: "Skills",
    singular: "skill",
    group: "Portfolio foundation",
    icon: Sparkles,
    template: { label: "", category: "", icon: "", sort_order: 0 },
    fields: [
      { key: "label", label: "Skill name", placeholder: "ROS 2" },
      { key: "category", label: "Skill category", placeholder: "Robotics Middleware" },
      { key: "icon", label: "Icon name or URL", placeholder: "ros, python, or an icon URL", nullable: true },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Add skills to group your technical capabilities on the home page.",
  },
  {
    key: "projects",
    label: "Projects",
    singular: "project",
    group: "Projects and media",
    icon: FolderKanban,
    template: { slug: "", title: "", subtitle: "", summary: "", description: "", status: "", start_date: "", end_date: "", tags: [], tools: [], outcomes: [], featured: false, sort_order: 0 },
    fields: [
      { key: "title", label: "Project title", placeholder: "Autonomous Medical Search & Rescue Robot" },
      { key: "slug", label: "Page URL name", placeholder: "autonomous-medical-search-rescue-robot", help: "Use lowercase words separated with hyphens." },
      { key: "subtitle", label: "Short subtitle", placeholder: "A multi-sensor rescue platform" },
      { key: "status", label: "Project status", placeholder: "Completed or Ongoing research" },
      { key: "start_date", label: "Start date", placeholder: "2025", nullable: true },
      { key: "end_date", label: "End date", placeholder: "2026", nullable: true },
      { key: "featured", label: "Feature on home page", kind: "toggle", help: "Featured projects are prioritised in the home-page project section." },
      { key: "summary", label: "Card summary", kind: "textarea", placeholder: "A concise description used on project cards." },
      { key: "description", label: "Full project description", kind: "textarea", placeholder: "Explain the methods, engineering work, and result." },
      { key: "tags", label: "Keywords", kind: "array", placeholder: "ROS 2, LiDAR SLAM, UAV" },
      { key: "tools", label: "Tools and technologies", kind: "array", placeholder: "Python, Jetson, Gazebo" },
      { key: "outcomes", label: "Outcomes", kind: "array", placeholder: "Prototype completed, Mapping validated" },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Create a project, then use Project media to add its images.",
  },
  {
    key: "project_media",
    label: "Project media",
    singular: "project-media item",
    group: "Projects and media",
    icon: ImageIcon,
    template: { project_id: 0, storage_path: "", alt: "", sort_order: 0 },
    fields: [
      { key: "project_id", label: "Project", kind: "select", relation: "projects", help: "Choose the project that should display this image." },
      { key: "storage_path", label: "Uploaded file path", placeholder: "Use the upload area below", help: "This field is filled automatically when you upload a file here." },
      { key: "alt", label: "Image description", placeholder: "Describe what appears in the image." },
      { key: "sort_order", label: "Gallery order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Select a project and upload media to build its visual gallery.",
  },
  {
    key: "section_icons",
    label: "Section icons",
    singular: "section icon",
    group: "Projects and media",
    icon: LayoutPanelLeft,
    template: { section_key: "", label: "", storage_path: "", alt: "", sort_order: 0 },
    fields: [
      { key: "section_key", label: "Section", placeholder: "education, projects, or services" },
      { key: "label", label: "Icon label", placeholder: "Robotic arm illustration" },
      { key: "storage_path", label: "Uploaded file path", placeholder: "Use the upload area below", help: "This field is filled automatically when you upload a file here." },
      { key: "alt", label: "Accessible description", placeholder: "Industrial robotic arm" },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Add an uploaded SVG or image to decorate a public-site section.",
  },
  {
    key: "service_areas",
    label: "Service areas",
    singular: "service area",
    group: "Services",
    icon: Settings2,
    template: { title: "", description: "", accent: "teal", icon: "robotics", sort_order: 0 },
    fields: [
      { key: "title", label: "Area title", placeholder: "ROS, SLAM & Robot Simulation" },
      { key: "description", label: "Area introduction", kind: "textarea", placeholder: "A short explanation of this service group." },
      { key: "accent", label: "Accent style", placeholder: "teal" },
      { key: "icon", label: "Icon name", placeholder: "robotics" },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Create a service area before adding individual services.",
  },
  {
    key: "services",
    label: "Services",
    singular: "service",
    group: "Services",
    icon: Wrench,
    template: { area_id: 0, title: "", summary: "", deliverables: [], sort_order: 0 },
    fields: [
      { key: "area_id", label: "Service area", kind: "select", relation: "service_areas", help: "Choose the service group that contains this item." },
      { key: "title", label: "Service title", placeholder: "ROS / ROS 2 Robotics Simulation & Development" },
      { key: "summary", label: "Service description", kind: "textarea", placeholder: "Explain the client-facing scope and engineering contribution." },
      { key: "deliverables", label: "Client deliverables", kind: "array", placeholder: "Source code, Setup instructions, Test summary" },
      { key: "sort_order", label: "Display order", kind: "number" },
    ],
    order: "sort_order",
    emptyMessage: "Create a service within an existing service area.",
  },
];

function cloneRecord(record: ContentRow) {
  return JSON.parse(JSON.stringify(record)) as ContentRow;
}

function labelForRow(row: ContentRow) {
  return String(row.title ?? row.name ?? row.label ?? row.role ?? row.institution ?? row.id ?? "Untitled record");
}

function rowMeta(row: ContentRow) {
  return String(row.status ?? row.category ?? row.organization ?? row.venue ?? row.section_key ?? row.id ?? "");
}

function readInputValue(value: unknown, kind: FieldKind) {
  if (kind === "array") return Array.isArray(value) ? value.join(", ") : "";
  if (value === null || value === undefined) return "";
  return String(value);
}

function editableRecord(tab: TabDefinition, row: ContentRow) {
  return tab.fields.reduce<ContentRow>((next, field) => {
    next[field.key] = row[field.key] ?? cloneRecord(tab.template)[field.key] ?? "";
    return next;
  }, {});
}

function savePayload(tab: TabDefinition, form: ContentRow) {
  return tab.fields.reduce<ContentRow>((next, field) => {
    const kind = field.kind ?? "text";
    const value = form[field.key];
    if (kind === "array") {
      next[field.key] = String(value ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
    } else if (kind === "number") {
      next[field.key] = value === "" || value === null || value === undefined ? 0 : Number(value);
    } else if (kind === "toggle") {
      next[field.key] = Boolean(value);
    } else if (field.nullable && value === "") {
      next[field.key] = null;
    } else {
      next[field.key] = value;
    }
    return next;
  }, {});
}

export function AdminConsole() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [sessionReady, setSessionReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [active, setActive] = useState<TabKey>("profiles");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [selected, setSelected] = useState<ContentRow | null>(null);
  const [form, setForm] = useState<ContentRow | null>(null);
  const [projectOptions, setProjectOptions] = useState<ContentRow[]>([]);
  const [serviceAreaOptions, setServiceAreaOptions] = useState<ContentRow[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signUpMode, setSignUpMode] = useState(false);
  const [uploadPath, setUploadPath] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<ContentRow | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const tab = tabs.find((item) => item.key === active)!;
  const ActiveIcon = tab.icon;
  const tabGroups = Array.from(new Set(tabs.map((item) => item.group)));

  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAdmin(false);
      setSessionReady(true);
      return;
    }
    const { data, error: rpcError } = await supabase.rpc("is_portfolio_admin");
    setIsAdmin(Boolean(data) && !rpcError);
    setSessionReady(true);
  }, [supabase]);

  const refreshRows = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingRows(true);
    setError("");
    let query = (supabase.from(active as never) as any).select("*");
    query = query.order(tab.order ?? "id", { ascending: true });
    const { data, error: queryError } = await query;
    setLoadingRows(false);
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setRows((data ?? []) as ContentRow[]);
  }, [active, isAdmin, supabase, tab.order]);

  const refreshRelationOptions = useCallback(async () => {
    if (!isAdmin) return;
    const [projectsResult, areasResult] = await Promise.all([
      (supabase.from("projects" as never) as any).select("id, title").order("sort_order", { ascending: true }),
      (supabase.from("service_areas" as never) as any).select("id, title").order("sort_order", { ascending: true }),
    ]);
    setProjectOptions((projectsResult.data ?? []) as ContentRow[]);
    setServiceAreaOptions((areasResult.data ?? []) as ContentRow[]);
  }, [isAdmin, supabase]);

  useEffect(() => {
    refreshSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => refreshSession());
    return () => listener.subscription.unsubscribe();
  }, [refreshSession, supabase]);

  useEffect(() => {
    refreshRows();
  }, [refreshRows]);

  useEffect(() => {
    refreshRelationOptions();
  }, [refreshRelationOptions]);

  function switchTab(nextTab: TabKey) {
    setActive(nextTab);
    setSelected(null);
    setForm(null);
    setUploadPath("");
    setNotice("");
    setError("");
  }

  function startNew() {
    setSelected(null);
    setForm(cloneRecord(tab.template));
    setNotice(`Complete the fields below, then save this ${tab.singular}.`);
    setError("");
  }

  function selectRow(row: ContentRow) {
    setSelected(row);
    setForm(editableRecord(tab, row));
    setNotice("");
    setError("");
  }

  function updateField(key: string, value: unknown) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const action = signUpMode
      ? supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } })
      : supabase.auth.signInWithPassword({ email, password });
    const { data, error: authError } = await action;
    if (authError) {
      setError(authError.message);
      return;
    }
    if (signUpMode && !data.session) {
      setNotice("Check your email to confirm the new account, then return here to sign in.");
    } else {
      setNotice("Signed in. Checking administrator permission now.");
    }
  }

  async function saveForm() {
    if (!form) return;
    try {
      setIsSaving(true);
      setError("");
      setNotice("");
      const payload = savePayload(tab, form);
      if (selected?.id) {
        const { error: updateError } = await (supabase.from(active as never) as any).update(payload).eq("id", selected.id);
        if (updateError) throw updateError;
        setNotice(`${tab.label} updated successfully.`);
      } else {
        const { data, error: insertError } = await (supabase.from(active as never) as any).insert(payload).select().single();
        if (insertError) throw insertError;
        if (data) {
          setSelected(data as ContentRow);
          setForm(editableRecord(tab, data as ContentRow));
        }
        setNotice(`New ${tab.singular} created successfully.`);
      }
      await refreshRows();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "This record could not be saved. Please check the fields and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRow() {
    if (!confirmDelete?.id) return;
    const { error: deleteError } = await (supabase.from(active as never) as any).delete().eq("id", confirmDelete.id as string | number);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setNotice(`${tab.label} record deleted.`);
      setForm(null);
      setSelected(null);
      await refreshRows();
    }
    setConfirmDelete(null);
  }

  function uploadTargetField() {
    if (active === "profiles") return "photo_path";
    if (active === "project_media" || active === "section_icons") return "storage_path";
    return null;
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    setNotice("");
    const path = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(path, file, { contentType: file.type, upsert: false });
    setIsUploading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    setUploadPath(path);
    const target = uploadTargetField();
    if (target) {
      setForm((current) => ({ ...(current ?? cloneRecord(tab.template)), [target]: path }));
      setNotice("Upload complete. The file path was added to the form automatically; save the record to publish it.");
    } else {
      setNotice("Upload complete. To attach this file to a project, open Project media and choose the project first.");
    }
  }

  async function removeLatestUpload() {
    if (!uploadPath) return;
    const { error: removeError } = await supabase.storage.from("portfolio-media").remove([uploadPath]);
    if (removeError) {
      setError(removeError.message);
      return;
    }
    const target = uploadTargetField();
    if (target && form?.[target] === uploadPath) updateField(target, "");
    setUploadPath("");
    setNotice("The unlinked upload was removed from Supabase Storage.");
  }

  function relationOptions(field: FieldDefinition) {
    if (field.relation === "projects") return projectOptions;
    if (field.relation === "service_areas") return serviceAreaOptions;
    return [];
  }

  function renderField(field: FieldDefinition) {
    if (!form) return null;
    const kind = field.kind ?? "text";
    const value = form[field.key];
    const fieldId = `field-${field.key}`;
    const isWide = kind === "textarea" || kind === "array";

    if (kind === "toggle") {
      return (
        <button
          className={`admin-toggle ${Boolean(value) ? "is-on" : ""}`}
          type="button"
          onClick={() => updateField(field.key, !Boolean(value))}
          aria-pressed={Boolean(value)}
          key={field.key}
        >
          <span className="admin-toggle-track"><span /></span>
          <span><strong>{field.label}</strong><small>{field.help}</small></span>
        </button>
      );
    }

    if (kind === "select") {
      const options = relationOptions(field);
      return (
        <label className="admin-field" key={field.key} htmlFor={fieldId}>
          <span>{field.label}</span>
          <select id={fieldId} value={readInputValue(value, kind)} onChange={(event) => updateField(field.key, event.target.value)}>
            <option value="">Choose an option</option>
            {options.map((option) => <option key={String(option.id)} value={String(option.id)}>{labelForRow(option)}</option>)}
          </select>
          {field.help && <small>{field.help}</small>}
        </label>
      );
    }

    if (kind === "textarea") {
      return (
        <label className="admin-field admin-field-wide" key={field.key} htmlFor={fieldId}>
          <span>{field.label}</span>
          <textarea id={fieldId} value={readInputValue(value, kind)} onChange={(event) => updateField(field.key, event.target.value)} placeholder={field.placeholder} />
          {field.help && <small>{field.help}</small>}
        </label>
      );
    }

    return (
      <label className={`admin-field ${isWide ? "admin-field-wide" : ""}`} key={field.key} htmlFor={fieldId}>
        <span>{field.label}</span>
        <input
          id={fieldId}
          type={kind === "number" ? "number" : "text"}
          value={readInputValue(value, kind)}
          onChange={(event) => updateField(field.key, event.target.value)}
          placeholder={field.placeholder}
        />
        {kind === "array" && <small>Separate items with commas.</small>}
        {field.help && <small>{field.help}</small>}
      </label>
    );
  }

  if (!sessionReady) {
    return <main className="admin-shell admin-loading"><LoaderCircle size={22} /><p className="eyebrow">Opening your content workspace</p></main>;
  }

  if (!isAdmin) {
    return (
      <main className="admin-shell auth-shell">
        <Link className="admin-brand" href="/">Mohammed Bajhaw</Link>
        <section className="auth-card">
          <div className="auth-icon"><UserRound size={24} /></div>
          <p className="eyebrow">Portfolio administration</p>
          <h1>{signUpMode ? "Create an administrator account" : "Welcome back"}</h1>
          <p>{signUpMode ? "Create an account, then request administrator approval before editing the portfolio." : "Sign in to update your projects, research, services, and media."}</p>
          <form onSubmit={submitAuth}>
            <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
            <button className="button primary" type="submit">{signUpMode ? "Create account" : "Sign in securely"}</button>
          </form>
          <button className="text-button" onClick={() => setSignUpMode(!signUpMode)}>{signUpMode ? "I already have an account" : "Create a new account"}</button>
          {notice && <p className="status-note">{notice}</p>}
          {error && <p className="error-note">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-brand" href="/">Mohammed Bajhaw <span>/ Content studio</span></Link>
        <div className="admin-topbar-actions">
          <Link className="admin-view-site" href="/">View public site <ChevronRight size={14} /></Link>
          <button className="text-button" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-intro"><p className="eyebrow">Content studio</p><strong>Manage the site in plain language.</strong></div>
          {tabGroups.map((group) => (
            <section className="admin-nav-group" key={group}>
              <p>{group}</p>
              {tabs.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon;
                return <button key={item.key} className={active === item.key ? "active" : ""} onClick={() => switchTab(item.key)}><Icon size={16} /><span>{item.label}</span></button>;
              })}
            </section>
          ))}
        </aside>

        <section className="admin-content">
          <div className="admin-title">
            <div>
              <div className="admin-title-icon"><ActiveIcon size={21} /></div>
              <p className="eyebrow">{tab.group}</p>
              <h1>{tab.label}</h1>
              <p>{tab.emptyMessage}</p>
            </div>
            <button className="button primary" onClick={startNew}><Plus size={16} /> New {tab.singular}</button>
          </div>

          <div className="admin-workspace">
            <section className="admin-list-panel">
              <div className="admin-list-heading"><div><p className="eyebrow">Saved records</p><strong>{loadingRows ? "Loading…" : `${rows.length} ${rows.length === 1 ? "record" : "records"}`}</strong></div><span>{tab.label}</span></div>
              <div className="admin-list">
                {loadingRows && <div className="admin-list-state"><LoaderCircle className="spin" size={18} /> Loading records</div>}
                {!loadingRows && rows.map((row) => (
                  <button className={selected?.id === row.id ? "selected" : ""} key={String(row.id)} onClick={() => selectRow(row)}>
                    <span className="admin-record-icon"><ActiveIcon size={15} /></span>
                    <span className="admin-record-copy"><strong>{labelForRow(row)}</strong><small>{rowMeta(row)}</small></span>
                    <ChevronRight size={15} />
                  </button>
                ))}
                {!loadingRows && rows.length === 0 && <div className="admin-list-state"><Sparkles size={18} /><p>{tab.emptyMessage}</p><button className="text-button" onClick={startNew}>Create the first {tab.singular}</button></div>}
              </div>
            </section>

            <section className="editor-panel">
              {form ? (
                <>
                  <div className="editor-heading"><div><p className="eyebrow">{selected ? "Editing saved record" : "Creating new record"}</p><h2>{selected ? labelForRow(selected) : `New ${tab.singular}`}</h2></div>{selected && <span className="editing-pill">Editing</span>}</div>
                  <div className="admin-form-grid">{tab.fields.map(renderField)}</div>
                  <div className="editor-actions">
                    <button className="button primary" onClick={saveForm} disabled={isSaving}>{isSaving ? <LoaderCircle className="spin" size={16} /> : <Save size={16} />}{isSaving ? "Saving…" : "Save changes"}</button>
                    {selected && <button className="button danger" onClick={() => setConfirmDelete(selected)}><Trash2 size={16} /> Delete record</button>}
                  </div>

                  <section className="uploader">
                    <div><p className="eyebrow">Media upload</p><h3>Upload an image or PDF</h3><p>For profile images, project media, and section icons, the uploaded file path is added to this form automatically.</p></div>
                    <label className="upload-label"><Upload size={17} />{isUploading ? "Uploading…" : "Choose file"}<input type="file" accept="image/*,.pdf" onChange={uploadFile} disabled={isUploading} /></label>
                    {uploadPath && <div className="upload-result"><Check size={17} /><div><strong>Upload ready</strong><code>{uploadPath}</code></div><button className="text-button" onClick={removeLatestUpload}><X size={14} /> Remove</button></div>}
                  </section>
                </>
              ) : (
                <div className="admin-empty-editor"><div className="admin-empty-icon"><ActiveIcon size={27} /></div><p className="eyebrow">Ready when you are</p><h2>Select a record or create a new one.</h2><p>Every field is labelled in plain English. There is no JSON to write or copy.</p><button className="button primary" onClick={startNew}><Plus size={16} /> New {tab.singular}</button></div>
              )}

              {notice && <p className="status-note">{notice}</p>}
              {error && <p className="error-note">{error}</p>}
            </section>
          </div>
        </section>
      </div>

      {confirmDelete && (
        <div className="delete-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-record-title">
          <section>
            <span className="delete-icon"><Trash2 size={20} /></span>
            <p className="eyebrow">Confirm deletion</p>
            <h2 id="delete-record-title">Delete “{labelForRow(confirmDelete)}”?</h2>
            <p>This permanently removes the selected record. Continue only if you no longer want it to appear on the portfolio.</p>
            <div className="editor-actions"><button className="button danger" onClick={deleteRow}>Delete permanently</button><button className="button" onClick={() => setConfirmDelete(null)}>Keep record</button></div>
          </section>
        </div>
      )}
    </main>
  );
}
