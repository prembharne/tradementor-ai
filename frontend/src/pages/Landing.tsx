import { FloatingNav } from "../components/brutalist/FloatingNav";
import { HeroSection } from "../components/brutalist/HeroSection";
import { SkewedMarquee } from "../components/brutalist/SkewedMarquee";
import { ServicesList } from "../components/brutalist/ServicesList";
import { BrutalistProtocol } from "../components/brutalist/BrutalistProtocol";
import { GiantCtaFooter } from "../components/brutalist/GiantCtaFooter";

export function Landing() {
  return (
    <main className="min-h-screen w-full bg-[#FF4D00] text-black overflow-x-hidden font-inter selection:bg-black selection:text-[#FF4D00]">
      {/* Floating Pill Top Navigation */}
      <FloatingNav />

      {/* Typographic Hero Section with 16vw Display & Circular Rotating Scroll Down */}
      <HeroSection />

      {/* Skewed Full-Width Black Marquee Band (-2deg) */}
      <SkewedMarquee />

      {/* Services / Pillars List in Pure Black with 45deg Arrow Reveal */}
      <ServicesList />

      {/* Live Discipline Protocol Architecture & Auditing Mechanism */}
      <BrutalistProtocol />

      {/* Giant CTA & Space Mono Footer */}
      <GiantCtaFooter />
    </main>
  );
}
