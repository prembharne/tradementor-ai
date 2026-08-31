import type { PropsWithChildren } from "react";

export function GlassPanel({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`obs-glass ${className}`}>{children}</div>;
}
