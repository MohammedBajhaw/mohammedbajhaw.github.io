import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ExternalLink, LayoutDashboard, LogOut, PanelLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return <div className="page-loading">LOADING ADMIN</div>;
  if (!user) {
    return <div className="page-loading"><button className="button-primary" onClick={() => startLogin()}>تسجيل الدخول لإدارة المحتوى</button></div>;
  }

  return (
    <div className="admin-page" dir="rtl">
      <header className="site-header">
        <div className="shell header-inner">
          <button className="wordmark" onClick={() => setLocation("/")}><span className="wordmark-mark"><PanelLeft size={14} /></span><span>Mohammed Bajhaw</span></button>
          <div className="site-nav">
            <button className="nav-admin" onClick={() => setLocation("/")}><ExternalLink size={13} /> عرض الموقع</button>
            <button className="nav-admin" onClick={logout}><LogOut size={13} /> خروج</button>
          </div>
        </div>
      </header>
      <div className="admin-shell">{children}</div>
    </div>
  );
}
