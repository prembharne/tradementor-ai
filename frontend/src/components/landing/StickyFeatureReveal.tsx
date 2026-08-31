import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { productFeatures } from "../../data/landingChapters";
import { GlassPanel } from "./GlassPanel";

export function StickyFeatureReveal() {
  const [active, setActive] = useState(0);
  const feature = productFeatures[active];

  return (
    <section id="product" className="obs-product obs-shell">
      <div className="obs-section-heading">
        <p className="obs-kicker">Instrument modules / 04</p>
        <h2>From raw decision to<br /><em>usable evidence.</em></h2>
      </div>
      <div className="obs-feature-layout">
        <div className="obs-feature-list">
          {productFeatures.map((item, index) => (
            <article key={item.index} onMouseEnter={() => setActive(index)} onFocusCapture={() => setActive(index)} className={index === active ? "is-active" : ""}>
              <button type="button" onClick={() => setActive(index)} aria-expanded={index === active}>
                <span>{item.index}</span><h3>{item.title}</h3><p>{item.copy}</p>
              </button>
            </article>
          ))}
        </div>
        <div className="obs-feature-sticky">
          <GlassPanel className="obs-readout">
            <div className="obs-readout-head"><span>LIVE MODULE</span><span>TM / {String(active + 1).padStart(2, "0")}</span></div>
            <AnimatePresence mode="wait">
              <motion.div key={feature.index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <p>DISCIPLINE OBSERVATORY</p><strong>{feature.stat}</strong><span>{feature.label}</span>
                <div className="obs-readout-lines"><i /><i /><i /><i /></div>
              </motion.div>
            </AnimatePresence>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
