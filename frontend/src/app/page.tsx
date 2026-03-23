import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import DemoSection from "@/components/DemoSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-900" style={{ background: "hsl(216, 89%, 86%)" }}>
      <Header />
      <HeroSection />
      <DemoSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
