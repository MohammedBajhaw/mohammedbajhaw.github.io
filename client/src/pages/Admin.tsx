import { useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const sections = [
  ["profile", "الملف الشخصي"], ["education", "التعليم"], ["publications", "المنشورات"], ["experiences", "الخبرات"], ["skills", "المهارات"], ["projects", "المشاريع"], ["media", "الصور"],
] as const;
type Section = (typeof sections)[number][0];
type Entry = Record<string, any>;

const emptyItem: Record<Exclude<Section, "profile">, Entry> = {
  education: { institution: "", degree: "", field: "", location: "", startYear: "", endYear: "", description: "", sortOrder: 0 },
  publications: { title: "", venue: "", publicationDate: "", status: "", authors: "", summary: "", details: "", keywords: [], url: "", sortOrder: 0 },
  experiences: { role: "", organization: "", location: "", startDate: "", endDate: "", isCurrent: false, summary: "", highlights: [], sortOrder: 0 },
  skills: { label: "", category: "", icon: "ROS", sortOrder: 0 },
  projects: { slug: "", title: "", subtitle: "", summary: "", description: "", status: "", startDate: "", endDate: "", tags: [], tools: [], outcomes: [], featured: false, sortOrder: 0 },
  media: { projectId: 0, url: "", storageKey: "", alt: "", sortOrder: 0 },
};

const labels: Record<string, string> = { name: "الاسم", professionalTitle: "العنوان المهني", location: "الموقع", email: "البريد الإلكتروني", linkedinUrl: "رابط LinkedIn", bio: "النبذة", institution: "الجامعة", degree: "الدرجة", field: "التخصص", startYear: "بداية", endYear: "نهاية", description: "الوصف", sortOrder: "ترتيب العرض", title: "العنوان", venue: "المؤتمر / المجلة", publicationDate: "التاريخ", status: "الحالة", authors: "المؤلفون", url: "رابط PDF", role: "المسمى", organization: "الجهة", startDate: "البداية", endDate: "النهاية", summary: "الملخص", details: "تفاصيل البحث", keywords: "الكلمات المفتاحية", highlights: "النقاط البارزة", label: "المهارة", category: "الفئة", icon: "مفتاح الأيقونة", slug: "رابط المشروع (slug)", subtitle: "العنوان الفرعي", tags: "الكلمات المفتاحية", tools: "الأدوات", outcomes: "النتائج", featured: "مشروع مختار", projectId: "المشروع", alt: "النص البديل للصورة", photoUrl: "رابط الصورة الشخصية" };

const fields: Record<Section, string[]> = {
  profile: ["name", "professionalTitle", "location", "email", "linkedinUrl", "bio", "photoUrl"],
  education: ["institution", "degree", "field", "location", "startYear", "endYear", "description", "sortOrder"],
  publications: ["title", "venue", "publicationDate", "status", "authors", "summary", "details", "keywords", "url", "sortOrder"],
  experiences: ["role", "organization", "location", "startDate", "endDate", "isCurrent", "summary", "highlights", "sortOrder"],
  skills: ["label", "category", "icon", "sortOrder"],
  projects: ["title", "slug", "subtitle", "status", "startDate", "endDate", "summary", "description", "tags", "tools", "outcomes", "featured", "sortOrder"],
  media: ["projectId", "url", "alt", "sortOrder"],
};

function displayTitle(section: Section, item: Entry) {
  if (section === "profile") return item.name || "الملف الشخصي";
  return item.title || item.role || item.label || item.institution || item.url || "عنصر جديد";
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [active, setActive] = useState<Section>("profile");
  const [selected, setSelected] = useState<Entry | null>(null);
  const utils = trpc.useUtils();
  const content = trpc.portfolio.content.useQuery({ type: active }, { enabled: !!user && user.role === "admin" });
  const projectsForMedia = trpc.portfolio.content.useQuery({ type: "projects" }, { enabled: !!user && user.role === "admin" });
  const allMedia = trpc.portfolio.content.useQuery({ type: "media" }, { enabled: !!user && user.role === "admin" });
  const save = trpc.portfolio.save.useMutation({ onSuccess: async () => { toast.success("تم حفظ المحتوى"); await utils.portfolio.content.invalidate({ type: active }); await utils.portfolio.public.invalidate(); } });
  const remove = trpc.portfolio.remove.useMutation({ onSuccess: async () => { toast.success("تم حذف العنصر"); setSelected(null); await utils.portfolio.content.invalidate(); await utils.portfolio.public.invalidate(); } });
  const removeMedia = trpc.portfolio.remove.useMutation({ onSuccess: async () => { toast.success("تم حذف الصورة"); await utils.portfolio.content.invalidate({ type: "media" }); await utils.portfolio.public.invalidate(); } });
  const uploadProjectImage = trpc.portfolio.uploadProjectImage.useMutation({ onSuccess: async () => { toast.success("تم رفع الصورة وحفظها في التخزين"); await utils.portfolio.content.invalidate({ type: "media" }); await utils.portfolio.public.invalidate(); } });
  const uploadProfilePhoto = trpc.portfolio.uploadProfilePhoto.useMutation({ onSuccess: async (stored) => { const profile = { ...((selected ?? (content.data as Entry)) || {}), photoUrl: stored.url, photoKey: stored.key }; setSelected(profile); save.mutate({ type: "profile", data: profile as any }); toast.success("تم رفع الصورة وحفظها؛ ستظهر في الصفحة الرئيسية خلال لحظات."); } });

  const entries = useMemo(() => {
    if (active === "profile") return content.data ? [content.data as Entry] : [];
    return Array.isArray(content.data) ? content.data as Entry[] : [];
  }, [active, content.data]);
  const mediaProjects = (projectsForMedia.data ?? []) as Array<{ id: number; title: string }>;
  const projectMedia = ((allMedia.data ?? []) as Entry[]).filter((media) => media.projectId === selected?.id);
  const editor = selected ?? entries[0] ?? (active === "profile" ? null : emptyItem[active]);

  const changeActive = (section: Section) => { setActive(section); setSelected(null); };
  const updateField = (field: string, value: unknown) => setSelected({ ...(editor ?? {}), [field]: value });
  const handleSave = () => { if (!editor) return; save.mutate({ type: active as any, data: editor as any }); };
  const handleFile = (file: File, profile = false, offset = 0) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      if (profile) uploadProfilePhoto.mutate({ filename: file.name, mimeType: file.type, base64 });
      else if (editor?.id) uploadProjectImage.mutate({ projectId: editor.id, filename: file.name, mimeType: file.type, base64, alt: `${editor.title} image`, sortOrder: projectMedia.length + offset });
      else toast.error("احفظ المشروع أولاً ثم ارفع صوره.");
    };
    reader.readAsDataURL(file);
  };
  const handleFiles = (files: FileList, profile = false) => Array.from(files).forEach((file, index) => handleFile(file, profile, index));

  if (loading) return <div className="page-loading">LOADING ADMIN</div>;
  return <DashboardLayout>{user?.role !== "admin" ? <div className="permission-note"><h2>صلاحية الإدارة مطلوبة</h2><p>سجّل الدخول بحساب مالك الموقع للوصول إلى إدارة المحتوى.</p></div> : <div>
    <div className="admin-head"><div><p className="section-index">CONTENT MANAGEMENT</p><h1>لوحة إدارة البورتفوليو</h1><p>يمكنك تعديل كل المحتوى هنا. البيانات الحالية مستخرجة من السيرة الذاتية، والصور التجريبية قابلة للاستبدال عبر التخزين السحابي.</p></div></div>
    <div className="admin-tabs">{sections.map(([key, label]) => <button className={`admin-tab ${active === key ? "active" : ""}`} onClick={() => changeActive(key)} key={key}>{label}</button>)}</div>
    <div className="admin-grid"><aside className="admin-list"><div className="admin-panel-title"><strong>العناصر</strong>{active !== "profile" && <button className="text-button" onClick={() => setSelected(emptyItem[active])}>+ إضافة</button>}</div>{content.isLoading ? <div className="admin-row">جارٍ التحميل…</div> : entries.map((item) => <button className={`admin-row ${editor?.id === item.id ? "active" : ""}`} onClick={() => setSelected(item)} key={item.id}><strong>{displayTitle(active, item)}</strong><span>{item.status || item.category || item.organization || item.location || ""}</span></button>)}</aside>
      <section className="admin-editor"><div className="admin-panel-title"><strong>{editor?.id ? "تعديل العنصر" : "إضافة عنصر"}</strong></div>{editor ? <div className="editor-form"><div className="field-grid">{fields[active].map((field) => {
        const value = editor[field]; const multiline = ["bio", "description", "summary", "highlights", "tags", "tools", "outcomes"].includes(field); const isBoolean = field === "featured" || field === "isCurrent";
        if (isBoolean) return <label className="checkbox-field field full" key={field}><input type="checkbox" checked={!!value} onChange={(e) => updateField(field, e.target.checked)} />{labels[field]}</label>;
        if (field === "projectId") return <label className="field" key={field}><span>{labels[field]}</span><select value={value || ""} onChange={(e) => updateField(field, Number(e.target.value))}><option value="">اختر مشروعاً</option>{mediaProjects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label>;
        if (field === "icon" && active === "skills") return <label className="field" key={field}><span>{labels[field]}</span><select value={value || "ROS"} onChange={(e) => updateField(field, e.target.value)}><option value="ROS">ROS</option><option value="LiDAR">LiDAR</option><option value="NVIDIA">NVIDIA</option><option value="Pixhawk">Pixhawk / Arduino</option><option value="OpenCV">OpenCV</option><option value="MATLAB">MATLAB</option><option value="SolidWorks">SolidWorks</option><option value="Python">Python</option><option value="Cplusplus">C++</option></select></label>;
        const printable = Array.isArray(value) ? value.join("\n") : value ?? "";
        return <label className={`field ${multiline ? "full" : ""}`} key={field}><span>{labels[field]}</span>{multiline ? <textarea value={printable} onChange={(e) => updateField(field, ["highlights", "tags", "tools", "outcomes"].includes(field) ? e.target.value.split("\n").filter(Boolean) : e.target.value)} /> : <input type={field === "sortOrder" ? "number" : "text"} value={printable} onChange={(e) => updateField(field, field === "sortOrder" ? Number(e.target.value) : e.target.value)} />}</label>;
      })}</div>
      {active === "profile" && <div className="upload-box"><p>ارفع صورتك الشخصية من جهازك. تحفظ تلقائياً في S3 وتُحدّث الملف الشخصي فوراً.</p><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files && handleFiles(event.target.files, true)} /></div>}
      {active === "projects" && <><div className="upload-box"><p>يمكنك اختيار عدة صور في المرة الواحدة. تُحفظ في S3 وتُعرض كلها في معرض صفحة المشروع.</p><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => event.target.files && handleFiles(event.target.files)} /></div>{editor?.id && <div className="media-manager"><p className="media-manager-title">صور هذا المشروع ({projectMedia.length})</p><div className="media-thumb-grid">{projectMedia.map((media) => <div className="media-thumb" key={media.id}><img src={media.url} alt={media.alt || "Project media"} /><button type="button" onClick={() => removeMedia.mutate({ type: "media", id: media.id })}>حذف</button></div>)}</div></div>}</>}
      <div className="editor-actions"><button className="button-primary" onClick={handleSave} disabled={save.isPending}>{save.isPending ? "جارٍ الحفظ…" : "حفظ التغييرات"}</button>{active !== "profile" && editor.id && <button className="danger-button" onClick={() => { if (window.confirm("هل تريد حذف هذا العنصر؟")) remove.mutate({ type: active as Exclude<Section, "profile">, id: editor.id }); }}>حذف</button>}</div></div> : <div className="editor-form">اختر عنصراً أو أضف عنصراً جديداً.</div>}</section>
    </div></div>}</DashboardLayout>;
}
