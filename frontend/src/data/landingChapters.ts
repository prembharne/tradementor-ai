export type LandingChapter = {
  id: string;
  label: string;
  index: string;
  start: number;
  end: number;
  title: string;
  copy: string;
  metric: string;
  metricLabel: string;
};

export type ObservatoryManifest = {
  frameCount: number;
  desktop: { path: string; width: number; height: number };
  mobile: { path: string; width: number; height: number };
  posters: { desktop: string; mobile: string; final: string };
};

export const observatoryManifest: ObservatoryManifest = {
  frameCount: 194,
  desktop: {
    path: "/frames/observatory/desktop/frame-{frame}.jpg",
    width: 1200,
    height: 675,
  },
  mobile: {
    path: "/frames/observatory/mobile/frame-{frame}.jpg",
    width: 540,
    height: 960,
  },
  posters: {
    desktop: "/frames/observatory/posters/poster-desktop.webp",
    mobile: "/frames/observatory/posters/poster-mobile.webp",
    final: "/frames/observatory/posters/poster-final.webp",
  },
};

export const landingChapters: LandingChapter[] = [
  {
    id: "signal",
    label: "Signal",
    index: "01",
    start: 0,
    end: 0.2,
    title: "Separate the setup from the noise.",
    copy: "Capture the market context, thesis, and invalidation before execution changes the story.",
    metric: "01",
    metricLabel: "Structured thesis",
  },
  {
    id: "decision",
    label: "Decision",
    index: "02",
    start: 0.2,
    end: 0.43,
    title: "Give every decision a boundary.",
    copy: "Define risk, size, and exit criteria against a versioned playbook—not the emotion of the moment.",
    metric: "1.0%",
    metricLabel: "Risk boundary",
  },
  {
    id: "review",
    label: "Review",
    index: "03",
    start: 0.43,
    end: 0.7,
    title: "Review the process, rule by rule.",
    copy: "TradeMentor AI turns execution into specific feedback on timing, sizing, adherence, and exits.",
    metric: "82",
    metricLabel: "Process score",
  },
  {
    id: "reputation",
    label: "Reputation",
    index: "04",
    start: 0.7,
    end: 1,
    title: "Make discipline verifiable.",
    copy: "Consistent process compounds into a durable reputation record published on Stellar testnet.",
    metric: "68",
    metricLabel: "On-chain score",
  },
];

export const productFeatures = [
  {
    index: "01 / REVIEW",
    title: "An analyst for your process—not your predictions.",
    copy: "AI review grades each trade against the rules you chose before entry. It finds recurring execution gaps without rewarding lucky outcomes.",
    stat: "Rule-level",
    label: "feedback",
  },
  {
    index: "02 / JOURNAL",
    title: "A journal built as evidence.",
    copy: "Keep thesis, screenshots, risk, outcome, and review together. Search the decisions behind performance instead of relying on memory.",
    stat: "1 record",
    label: "per decision",
  },
  {
    index: "03 / PLAYBOOK",
    title: "Rules that evolve with observed behavior.",
    copy: "Version strategy playbooks, compare adherence over time, and turn repeated lessons into explicit operating constraints.",
    stat: "Versioned",
    label: "strategy rules",
  },
  {
    index: "04 / CHALLENGES",
    title: "Practice discipline in measurable sprints.",
    copy: "Use time-boxed challenges to focus on one behavior at a time—from position sizing to patient entries.",
    stat: "7 days",
    label: "focused practice",
  },
];
