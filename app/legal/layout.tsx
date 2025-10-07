import HeroHeader from "@/components/header";
import Footer from "@/components/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-muted/50">
      <HeroHeader />
      <div className="relative isolate flex flex-col min-h-screen">
        {children}
      </div>
      <Footer />
    </main>
  );
}
