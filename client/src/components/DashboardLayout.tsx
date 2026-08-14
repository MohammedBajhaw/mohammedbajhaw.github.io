import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { ExternalLink, LayoutDashboard, LogOut, PanelLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, user, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return <div className="page-loading">LOADING ADMIN</div>;
  if (!user) {
    const isLocalPreview = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isLocalPreview) {
      return <div className="page-loading"><div className="local-auth-note"><strong>Use the published site to sign in.</strong><span>Localhost is a development preview and cannot complete the secure sign-in redirect.</span><a className="button-primary" href="https://engportfolio-zhkmdjuy.manus.space/admin">Open published admin</a></div></div>;
    }
    return <div className="page-loading"><button className="button-primary" onClick={() => startLogin()}>Sign in to manage content</button></div>;
  }

  return (
    <div className="admin-page" dir="ltr">
      <header className="site-header">
        <div className="shell header-inner">
          <button className="wordmark" onClick={() => setLocation("/")}><span className="wordmark-mark"><PanelLeft size={14} /></span><span>Mohammed Bajhaw</span></button>
          <div className="site-nav">
            <button className="nav-admin" onClick={() => setLocation("/")}><ExternalLink size={13} /> View site</button>
            <button className="nav-admin" onClick={logout}><LogOut size={13} /> Sign out</button>
          </div>
        </div>
      </header>
      <div className="admin-shell">{children}</div>
    </div>
  );
}
