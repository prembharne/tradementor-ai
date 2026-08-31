import type { RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import type { LandingChapter } from "../../data/landingChapters";

type ChapterRailProps = {
  chapters: LandingChapter[];
  activeIndex: number;
  progress: MotionValue<number>;
  sectionRef: RefObject<HTMLElement | null>;
};

export function ChapterRail({ chapters, activeIndex, progress, sectionRef }: ChapterRailProps) {
  const jumpTo = (start: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const available = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: section.offsetTop + available * start + 2, behavior: "smooth" });
  };

  return (
    <nav className="obs-rail" aria-label="Observatory chapters">
      <div className="obs-rail-track"><motion.span style={{ scaleY: progress }} /></div>
      {chapters.map((chapter, index) => (
        <button
          key={chapter.id}
          type="button"
          className={index === activeIndex ? "is-active" : ""}
          aria-current={index === activeIndex ? "step" : undefined}
          onClick={() => jumpTo(chapter.start)}
        >
          <span>{chapter.index}</span>{chapter.label}
        </button>
      ))}
    </nav>
  );
}
