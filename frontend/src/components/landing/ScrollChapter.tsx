import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { landingChapters, observatoryManifest } from "../../data/landingChapters";
import { ChapterRail } from "./ChapterRail";
import { FrameSequenceCanvas } from "./FrameSequenceCanvas";
import { GlassPanel } from "./GlassPanel";

export function ScrollChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 28, mass: 0.35 });

  useMotionValueEvent(progress, "change", (value) => {
    const nextIndex = landingChapters.findIndex((chapter) => value >= chapter.start && value < chapter.end);
    setActiveIndex(nextIndex < 0 ? landingChapters.length - 1 : nextIndex);
  });

  const active = landingChapters[activeIndex];

  return (
    <section ref={sectionRef} id="observatory" className="obs-scroll-chapter">
      <div className="obs-sticky">
        <FrameSequenceCanvas progress={progress} manifest={observatoryManifest} reducedMotion={reducedMotion} />
        <div className="obs-vignette" />
        <ChapterRail chapters={landingChapters} activeIndex={activeIndex} progress={progress} sectionRef={sectionRef} />
        <div className="obs-chapter-copy" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              <p className="obs-kicker">{active.index} — {active.label}</p>
              <h2>{active.title}</h2>
              <p>{active.copy}</p>
              <GlassPanel className="obs-metric">
                <strong>{active.metric}</strong>
                <span>{active.metricLabel}</span>
              </GlassPanel>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="obs-scroll-note"><span /> Scroll to calibrate</div>
      </div>
      <div className="sr-only">
        {landingChapters.map((chapter) => <article key={chapter.id}><h2>{chapter.label}: {chapter.title}</h2><p>{chapter.copy}</p></article>)}
      </div>
    </section>
  );
}
