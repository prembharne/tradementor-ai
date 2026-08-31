import { ArrowDown } from "lucide-react";

interface RotatingScrollIndicatorProps {
  text?: string;
  onClick?: () => void;
  className?: string;
}

export function RotatingScrollIndicator({
  text = "SCROLL DOWN • SCROLL DOWN • SCROLL DOWN • ",
  onClick,
  className = "",
}: RotatingScrollIndicatorProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-36 h-36 flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      {/* Black circular background pill */}
      <div className="absolute inset-0 bg-black rounded-full transition-transform duration-300 group-hover:scale-105" />

      {/* Rotating SVG text container */}
      <svg
        className="absolute inset-0 w-full h-full animate-spin-12s"
        viewBox="0 0 144 144"
      >
        <path
          id="circlePath"
          d="M 72, 72 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
          fill="none"
        />
        <text className="font-mono-brutal text-[9px] font-bold fill-white uppercase tracking-widest">
          <textPath href="#circlePath" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>

      {/* Static center arrow */}
      <div className="relative z-10 text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-y-1">
        <ArrowDown size={24} className="stroke-[2.5]" />
      </div>
    </div>
  );
}
