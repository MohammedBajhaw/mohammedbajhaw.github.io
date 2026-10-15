import { AdminConsole } from "@/components/admin/AdminConsole";

export const metadata = { title: "Portfolio Administration", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminConsole />;
}
