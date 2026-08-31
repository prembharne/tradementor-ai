import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function FloatingNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 flex items-center justify-between pointer-events-none">
      {/* Left: Brand Logo */}
      <div className="pointer-events-auto">
        <Link
          to="/"
          className="font-archivo text-xl md:text-2xl font-black text-black tracking-tighter hover:opacity-80 transition-opacity"
        >
          TRADEMENTOR®
        </Link>
      </div>

      {/* Center: Floating Black Pill Container */}
      <nav className="pointer-events-auto hidden md:flex items-center gap-1 bg-black px-4 py-2 rounded-full border border-black shadow-lg">
        {[
          { label: "WORK", href: "#work" },
          { label: "SERVICES", href: "#services" },
          { label: "PROTOCOL", href: "#protocol" },
          { label: "ABOUT", href: "#contact" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="px-4 py-1.5 rounded-full font-mono-brutal text-xs font-bold text-white uppercase tracking-wider transition-all duration-200 hover:bg-white hover:text-black"
          >
            {item.label}
          </a>
        ))}
        <Link
          to="/login"
          className="px-4 py-1.5 rounded-full font-mono-brutal text-xs font-bold bg-[#FF4D00] text-black uppercase tracking-wider transition-all duration-200 hover:bg-white hover:text-black flex items-center gap-1"
        >
          <span>APP</span>
          <ArrowUpRight size={13} className="stroke-[3]" />
        </Link>
      </nav>

      {/* Right: Social & Connect Icons */}
      <div className="pointer-events-auto flex items-center gap-2">
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110 hover:bg-white hover:text-black"
          aria-label="Twitter"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center transition-transform hover:scale-110 hover:bg-white hover:text-black"
          aria-label="GitHub"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
        <Link
          to="/login"
          className="md:hidden px-4 py-2 rounded-full bg-black font-mono-brutal text-xs font-bold text-white uppercase tracking-wider hover:bg-white hover:text-black transition-all"
        >
          APP
        </Link>
      </div>
    </header>
  );
}
