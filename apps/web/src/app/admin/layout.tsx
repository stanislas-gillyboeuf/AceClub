import { ThemeProvider } from "@/components/theme-provider";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin - AceClub",
  description: "Tableau de bord d'administration AceClub",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="flex h-screen overflow-hidden bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
