import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

interface SlideLauncherProps {
  onSuccess?: () => void;
  targetUrl?: string;
  label?: string;
  className?: string;
}

export function SlideLauncher({
  targetUrl = "/login",
  label = "SLIDE TO LAUNCH APP",
  className = "",
}: SlideLauncherProps) {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxDrag, setMaxDrag] = useState(240);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);
  const controls = useAnimation();

  // Compute track width - knob width on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (trackRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        const knobWidth = window.innerWidth >= 768 ? 64 : 48; // knob width
        const padding = 16; // 8px on each side
        setMaxDrag(Math.max(100, trackWidth - knobWidth - padding));
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Opacity of the background text as knob drags
  const textOpacity = useTransform(x, [0, maxDrag * 0.6], [1, 0.1]);
  // Fill progress width behind knob
  const progressWidth = useTransform(x, (currentX) => `${currentX + 32}px`);

  const handleDragEnd = async () => {
    setIsDragging(false);
    const currentX = x.get();
    const threshold = maxDrag * 0.75;

    if (currentX >= threshold) {
      // Completed unlock!
      setIsUnlocked(true);
      await controls.start({ x: maxDrag, transition: { type: "spring", stiffness: 400, damping: 30 } });
      setTimeout(() => {
        navigate(targetUrl);
      }, 400);
    } else {
      // Snap back
      controls.start({ x: 0, transition: { type: "spring", stiffness: 500, damping: 35 } });
    }
  };

  const handleTrackClick = () => {
    // Quick click on track also triggers smooth auto-slide
    if (!isUnlocked && !isDragging) {
      setIsUnlocked(true);
      controls.start({ x: maxDrag, transition: { duration: 0.35, ease: "easeOut" } }).then(() => {
        setTimeout(() => {
          navigate(targetUrl);
        }, 300);
      });
    }
  };

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className={`relative w-full max-w-sm sm:max-w-md md:max-w-lg h-16 md:h-20 bg-black rounded-full p-2 flex items-center select-none shadow-[0_10px_30px_rgba(0,0,0,0.35)] cursor-pointer overflow-hidden border-2 border-black group ${className}`}
    >
      {/* Orange Progress Fill */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 bg-[#FF4D00]/30 rounded-full pointer-events-none"
        style={{ width: progressWidth }}
      />

      {/* Background Central Prompt Text */}
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none pl-12 pr-4"
      >
        <div className="flex items-center gap-2 text-white font-mono-brutal text-xs sm:text-sm font-bold uppercase tracking-widest">
          <span>{isUnlocked ? "LAUNCHING WORKSPACE..." : label}</span>
          {!isUnlocked && (
            <motion.div
              animate={{ x: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
              className="flex items-center text-[#FF4D00]"
            >
              <ArrowRight size={16} className="stroke-[3]" />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Draggable Knob */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.05}
        dragMomentum={false}
        animate={controls}
        style={{ x }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl transition-colors duration-200 group-hover:bg-[#FF4D00] group-hover:text-black"
      >
        {isUnlocked ? (
          <Check size={26} className="stroke-[3.5] text-black animate-bounce" />
        ) : (
          <div className="flex items-center justify-center">
            <ArrowRight size={22} className="stroke-[3] transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
