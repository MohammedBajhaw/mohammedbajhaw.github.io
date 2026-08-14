import { ArrowRight, ExternalLink, FileText, UsersRound } from "lucide-react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function PublicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.portfolio.public.useQuery();
  if (isLoading) return <div className="page-loading">LOADING PUBLICATION</div>;
  const publication = data?.publications.find((item) => item.id === Number(id));
  if (!publication) return <div className="page-loading">البحث غير موجود</div>;
  return <div className="site-shell" dir="rtl">
    <header className="site-header"><div className="shell header-inner"><Link className="wordmark" href="/"><span className="wordmark-mark">MB</span><span>Mohammed Bajhaw</span></Link><Link className="nav-admin" href="/">الرئيسية <ArrowRight size={13} /></Link></div></header>
    <main className="publication-detail"><div className="shell"><Link className="project-back" href="/"><ArrowRight size={16} /> العودة إلى المنشورات</Link><section className="publication-detail-hero"><p className="eyebrow">{publication.venue}</p><h1>{publication.title}</h1><div className="publication-meta-grid"><div><span>Publication Status</span><strong>{publication.status}</strong></div><div><span>Conference / Venue</span><strong>{publication.venue}</strong></div><div><span>Publication Date</span><strong>{publication.publicationDate}</strong></div><div><span>Authors</span><strong>{publication.authors}</strong></div></div></section><section className="publication-content"><div className="paper-main"><div className="paper-section"><span className="paper-label">Abstract</span><h2>الملخص</h2><p>{publication.summary}</p></div><div className="paper-section"><span className="paper-label">Paper Details</span><h2>تفاصيل البحث</h2><p>{publication.details || "يمكن إضافة المنهجية والنتائج والتفاصيل الكاملة للبحث من لوحة التحكم."}</p></div><div className="paper-section"><span className="paper-label">Keywords</span><h2>الكلمات المفتاحية</h2><div className="keyword-list">{publication.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}</div></div></div><aside className="paper-side"><div className="paper-authors"><UsersRound size={18} /><h3>Contributors</h3><p>{publication.authors || "Add contributors from admin"}</p></div><div className="paper-pdf"><FileText size={20} /><h3>Paper PDF</h3><p>{publication.url ? "The research paper is available to open or download." : "أضف رابط ملف PDF للورقة من لوحة التحكم ليظهر هنا."}</p>{publication.url ? <a className="button-primary" href={publication.url} target="_blank" rel="noreferrer">Open PDF <ExternalLink size={15} /></a> : <span className="button-secondary is-disabled">PDF link pending</span>}</div></aside></section></div></main>
  </div>;
}
