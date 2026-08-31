import { ArrowDown, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useWallet } from "../../contexts/useWallet";
import { observatoryManifest } from "../../data/landingChapters";
import { MagneticButton } from "./MagneticButton";
import { WorkspaceButton } from "./WorkspaceButton";

export function ObservatoryHero() {
  const { isConnected } = useWallet();
  const reducedMotion = useReducedMotion();

  return (
    <section className="obs-hero">
      <div className="obs-hero-glow" />
      <div className="obs-shell obs-hero-grid">
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="obs-hero-copy">
          <p className="obs-kicker">TradeMentor AI / Discipline system</p>
          <h1>Make discipline <em>visible.</em></h1>
          <p className="obs-lede">Turn every trading decision into structured evidence—reviewed against your rules and resolved into a reputation you can verify.</p>
          <div className="obs-actions">
            <MagneticButton><WorkspaceButton className="obs-button obs-button-primary">{isConnected ? "Open dashboard" : "Enter observatory"}<ArrowRight size={17} /></WorkspaceButton></MagneticButton>
            <a className="obs-button obs-button-quiet" href="#observatory">Inspect the system <ArrowDown size={16} /></a>
          </div>
          <ul className="obs-principles"><li>No signals</li><li>No profit promises</li><li>Process only</li></ul>
        </motion.div>
        <motion.div initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.1 }} className="obs-hero-art" aria-hidden="true">
          <picture><source media="(max-width: 700px)" srcSet={observatoryManifest.posters.mobile} /><img src={observatoryManifest.posters.desktop} alt="" /></picture>
          <div className="obs-art-index"><span>OBJECT / 001</span><span>SCROLL RESPONSIVE</span></div>
        </motion.div>
      </div>
      <a href="#observatory" className="obs-hero-scroll"><span /> Begin observation</a>
    </section>
  );
}
