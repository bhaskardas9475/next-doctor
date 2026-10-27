import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="page-shell">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
