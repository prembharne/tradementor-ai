export function SkewedMarquee() {
  const row1Items = [
    "AI COACHING",
    "STELLAR SOROBAN",
    "ON-CHAIN REPUTATION",
    "DISCIPLINE OVER PROFIT",
    "STRATEGY VERSIONING",
    "AI COACHING",
    "STELLAR SOROBAN",
    "ON-CHAIN REPUTATION",
    "DISCIPLINE OVER PROFIT",
    "STRATEGY VERSIONING",
  ];

  const row2Items = [
    "TRADE REVIEWS",
    "VISION CHARTS",
    "ZERO EMOTION",
    "PROOF OF DISCIPLINE",
    "RULE ENFORCEMENT",
    "TRADE REVIEWS",
    "VISION CHARTS",
    "ZERO EMOTION",
    "PROOF OF DISCIPLINE",
    "RULE ENFORCEMENT",
  ];

  return (
    <section
      id="skewed-banner"
      className="relative w-full bg-black py-16 md:py-24 my-12 md:my-20 overflow-hidden transform -skew-y-2 select-none border-y-4 border-black"
    >
      {/* Container with counter-skew for content stability or raw skew */}
      <div className="flex flex-col gap-4 md:gap-8">
        {/* Row 1: Orange text moving Left */}
        <div className="overflow-hidden whitespace-nowrap flex">
          <div className="animate-marquee-left flex items-center gap-6">
            {row1Items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="font-archivo text-6xl sm:text-8xl md:text-[9vw] font-black text-[#FF4D00] uppercase tracking-tighter leading-none">
                  {item}
                </span>
                <span className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#FF4D00] inline-block" />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2: White text moving Right (Reverse) */}
        <div className="overflow-hidden whitespace-nowrap flex">
          <div className="animate-marquee-right flex items-center gap-6">
            {row2Items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6">
                <span className="font-archivo text-6xl sm:text-8xl md:text-[9vw] font-black text-white/80 uppercase tracking-tighter leading-none">
                  {item}
                </span>
                <span className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-white/80 inline-block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
