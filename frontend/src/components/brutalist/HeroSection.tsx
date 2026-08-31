import { RotatingScrollIndicator } from "./RotatingScrollIndicator";

interface HeroSectionProps {
  onScrollDown?: () => void;
}

export function HeroSection({ onScrollDown }: HeroSectionProps) {
  const scrollToNext = () => {
    const el = document.getElementById("skewed-banner");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (onScrollDown) {
      onScrollDown();
    }
  };

  return (
    <section className="relative min-h-screen bg-[#FF4D00] text-black flex flex-col justify-between pt-24 pb-10 px-4 md:px-8 overflow-hidden select-none">
      {/* Top spacing */}
      <div className="w-full" />

      {/* Main Massive Headline */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-6">
        <h1 className="font-archivo text-[15vw] sm:text-[16vw] font-black text-black text-center uppercase tracking-tighter leading-[0.82] select-none">
          TRADE
          <br />
          MENTOR
        </h1>
      </div>

      {/* Hero Bottom Section with 2px Black Line and Metadata */}
      <div className="w-full relative">
        {/* 2px Solid Black Border Divider */}
        <div className="w-full border-t-2 border-black mb-6 md:mb-8" />

        {/* Metadata Row */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 font-mono-brutal text-xs md:text-sm font-bold uppercase tracking-wider text-black">
          {/* Left Metadata */}
          <div className="flex items-center gap-2 text-center md:text-left z-10">
            <span className="text-base">🌐</span>
            <span>BASED IN DECENTRALIZED STELLAR</span>
          </div>

          {/* Center Rotating Scroll Indicator (overlapping/centered) */}
          <div className="relative md:absolute md:left-1/2 md:top-0 md:-translate-x-1/2 md:-translate-y-[calc(50%+1.5rem)] z-20">
            <RotatingScrollIndicator onClick={scrollToNext} />
          </div>

          {/* Right Metadata */}
          <div className="text-center md:text-right z-10 flex flex-col">
            <span>AI TRADING DISCIPLINE</span>
            <span className="text-black/80 font-normal">SINCE 2024</span>
          </div>
        </div>
      </div>
    </section>
  );
}
