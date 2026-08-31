import { ArrowUpRight } from "lucide-react";

interface ServiceItem {
  number: string;
  title: string;
  tags: string[];
  description: string;
}

const services: ServiceItem[] = [
  {
    number: "(01)",
    title: "AI COACHING",
    tags: ["LLM AUDITING", "VISION CHARTS", "EMOTION DETECTION"],
    description:
      "Automated trade grading comparing execution against explicit strategy rules with LLM and multimodal vision.",
  },
  {
    number: "(02)",
    title: "REPUTATION",
    tags: ["STELLAR SOROBAN", "VERIFIABLE SCORE", "LEADERBOARD"],
    description:
      "Discipline-weighted reputation recorded on-chain. Provable track record independent of lucky market regimes.",
  },
  {
    number: "(03)",
    title: "STRATEGY VAULT",
    tags: ["IMMUTABLE PLAYBOOKS", "VERSION CONTROL", "RISK CAPS"],
    description:
      "On-chain smart contract versioning of your trading playbooks with strict risk parameters.",
  },
  {
    number: "(04)",
    title: "CHALLENGES",
    tags: ["DISCIPLINE STREAKS", "PROOF SUBMISSION", "BADGES"],
    description:
      "Interactive discipline milestone quests that validate rule compliance and mint verifiable reputation proofs.",
  },
];

export function ServicesList() {
  return (
    <section id="services" className="w-full bg-black text-white py-20 md:py-32 px-4 md:px-8 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-white/20 pb-12 mb-8">
        <h2 className="font-archivo text-6xl sm:text-8xl md:text-[10vw] font-black uppercase tracking-tighter text-white leading-none">
          SERVICES
        </h2>
        {/* Brutalist Orange Star */}
        <div className="text-[#FF4D00] text-5xl sm:text-7xl md:text-8xl font-black select-none">
          ★
        </div>
      </div>

      {/* Services List Items */}
      <div className="flex flex-col">
        {services.map((service) => (
          <article
            key={service.number}
            className="group relative w-full border-b border-white/20 py-8 md:py-12 px-2 md:px-6 transition-all duration-300 hover:bg-white/[0.05] cursor-pointer"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Number & Title & Tags */}
              <div className="flex flex-col md:flex-row md:items-start lg:items-center gap-4 md:gap-8">
                {/* Number in Orange Space Mono */}
                <span className="font-mono-brutal text-lg md:text-2xl font-bold text-[#FF4D00]">
                  {service.number}
                </span>

                {/* Title and Tags */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-archivo text-4xl sm:text-6xl md:text-[6.5vw] font-black uppercase tracking-tighter text-white leading-none transition-transform duration-300 ease-out group-hover:translate-x-4 md:group-hover:translate-x-6">
                    {service.title}
                  </h3>

                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 transition-transform duration-300 ease-out group-hover:translate-x-4 md:group-hover:translate-x-6">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono-brutal text-[10px] md:text-xs uppercase px-3 py-1 rounded-full border border-white/30 text-white/90 bg-black/40 font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Arrow Icon Reveal */}
              <div className="flex items-center justify-end">
                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-transparent group-hover:border-[#FF4D00] flex items-center justify-center transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:scale-110">
                  <ArrowUpRight
                    size={36}
                    className="text-[#FF4D00] stroke-[2.5] transition-transform duration-300 group-hover:rotate-45"
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
