import { useRef, useState, type PropsWithChildren } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function MagneticButton({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  return (
    <motion.span
      ref={ref}
      className={className}
      animate={offset}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType === "touch") return;
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return;
        setOffset({ x: (event.clientX - bounds.left - bounds.width / 2) * 0.1, y: (event.clientY - bounds.top - bounds.height / 2) * 0.1 });
      }}
      onPointerLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </motion.span>
  );
}
