import { useRef, useState, type PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function PerspectiveCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg)");

  return (
    <motion.div
      ref={ref}
      className={`obs-perspective ${className}`}
      style={{ transform }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType === "touch") return;
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        setTransform(`rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`);
      }}
      onPointerLeave={() => setTransform("rotateX(0deg) rotateY(0deg)")}
    >
      {children}
    </motion.div>
  );
}
