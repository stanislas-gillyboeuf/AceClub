import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-theme min-h-screen flex flex-col bg-mkt-bg text-mkt-fg">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
