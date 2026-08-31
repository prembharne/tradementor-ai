import { SlideLauncher } from "./SlideLauncher";

export function GiantCtaFooter() {
  return (
    <section id="contact" className="w-full bg-[#FF4D00] text-black select-none">
      {/* Giant CTA Area */}
      <div className="py-20 md:py-32 px-4 md:px-8 flex flex-col items-center justify-center text-center">
        <h2 className="font-archivo text-[13vw] sm:text-[14vw] font-black uppercase tracking-tighter text-black leading-[0.85] mb-10 md:mb-14">
          LET'S TRADE
        </h2>

        {/* Interactive Slide Launcher */}
        <div className="w-full flex flex-col items-center justify-center">
          <SlideLauncher targetUrl="/login" label="SLIDE TO LAUNCH APP" />
          <p className="font-mono-brutal text-[11px] md:text-xs text-black/80 font-bold uppercase tracking-wider mt-4">
            DRAG TO ENTER TRADEMENTOR WORKSPACE
          </p>
        </div>
      </div>

      {/* 2px Solid Black Border Divider */}
      <div className="w-full border-t-2 border-black" />

      {/* Footer Row */}
      <footer className="w-full py-8 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono-brutal text-xs md:text-sm font-bold uppercase tracking-wider">
        {/* Left: Copyright */}
        <div className="text-black">
          © 2026 TRADEMENTOR AI INC.
        </div>

        {/* Right: Social & Resource Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-black">
          {[
            { label: "TWITTER", href: "https://twitter.com" },
            { label: "DISCORD", href: "https://discord.com" },
            { label: "STELLAR", href: "https://stellar.org" },
            { label: "GITHUB", href: "https://github.com" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="hover:underline hover:opacity-75 transition-opacity"
            >
              {item.label}
            </a>
          ))}
        </div>
      </footer>
    </section>
  );
}
