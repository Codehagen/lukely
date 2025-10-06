import HeroHeader from "@/components/header";
import HeroSection from "@/components/hero-section";
import HowItWorksSection from "@/components/how-it-works-3";
import FeaturesSection from "@/components/features-1";
import Pricing from "@/components/pricing";
import Footer from "@/components/footer";
import FAQsTwo from "@/components/faqs-2";
import Testimonials from "@/components/testimonials-8";

export default function LandingPage() {
  return (
    <main className="bg-muted/50">
      <HeroHeader />
      <div className="relative isolate flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Pricing />
        <Testimonials />
        <FAQsTwo />
      </div>
      <Footer />
    </main>
  );
}
