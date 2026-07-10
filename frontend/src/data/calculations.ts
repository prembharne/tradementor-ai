import type {
  ChallengeProgress,
  MetricSet,
  Strategy,
  StrategyInput,
  Trade,
  TradeInput,
  TradeMentorState,
  TradeReview,
  WeeklyReport,
} from "./types";

const now = new Date().toISOString();

export const demoState: TradeMentorState = {
  strategies: [
    {
      id: "strategy-london-breakout",
      name: "London Breakout Discipline",
      market: "BTCUSDT",
      timeframe: "15m",
      riskPercent: 1,
      rewardRatio: 2.2,
      entryRules: [
        "Trade only after the first 15m candle closes",
        "Enter on break and retest of session high or low",
        "Confirm displacement candle before entry",
      ],
      exitRules: [
        "Stop beyond invalidation wick",
        "Take partial profit at 1R",
        "Trail remaining position after structure break",
      ],
      status: "published",
      version: 3,
      updatedAt: now,
    },
    {
      id: "strategy-mean-reversion",
      name: "ETH Mean Reversion Review",
      market: "ETHUSDT",
      timeframe: "1h",
      riskPercent: 0.75,
      rewardRatio: 1.8,
      entryRules: [
        "Wait for deviation outside prior day range",
        "Enter only after reclaim confirmation",
        "Avoid entries during high impact news",
      ],
      exitRules: [
        "Target range midpoint first",
        "Move stop to break-even after midpoint",
      ],
      status: "draft",
      version: 1,
      updatedAt: now,
    },
  ],
  trades: [
    {
      id: "trade-btc-001",
      strategyId: "strategy-london-breakout",
      symbol: "BTCUSDT",
      side: "Long",
      entry: 63780,
      exit: 65240,
      stopLoss: 63220,
      takeProfit: 65180,
      riskPercent: 0.9,
      date: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString().slice(0, 10),
      notes:
        "Waited for the first 15m candle close, took the retest after displacement, and avoided adding late even when price accelerated.",
      emotion: "Patient",
      review: {
        score: 92,
        outcomeR: 2.61,
        summary: "Strong rule adherence with clean risk sizing and no late chase behavior.",
        followed: ["Risk stayed within 1%", "Reward target met strategy minimum", "Notes show clear pre-entry confirmation"],
        violated: [],
        riskFeedback: "Risk was 0.9%, inside the strategy cap. Position sizing discipline was intact.",
        psychology: "Patient execution. The notes show confirmation-based entry rather than urgency.",
        chartRead: "Structure favored continuation after a retest of the session high with displacement.",
        nextStep: "Repeat the same confirmation checklist for the next three trades before increasing size.",
      },
    },
    {
      id: "trade-eth-001",
      strategyId: "strategy-mean-reversion",
      symbol: "ETHUSDT",
      side: "Short",
      entry: 3488,
      exit: 3440,
      stopLoss: 3512,
      takeProfit: 3425,
      riskPercent: 0.85,
      date: new Date(Date.now() - 1000 * 60 * 60 * 58).toISOString().slice(0, 10),
      notes:
        "Good deviation setup, but entry was slightly early before the reclaim failure fully confirmed. Reduced size after noticing hesitation.",
      emotion: "Hesitant",
      review: {
        score: 71,
        outcomeR: 2,
        summary: "Profitable trade, but process score was capped by early entry and risk slightly above plan.",
        followed: ["Reward profile met strategy target", "Trade notes captured the decision quality"],
        violated: ["Risk exceeded the 0.75% strategy cap", "Entry preceded full confirmation"],
        riskFeedback: "Risk was 0.85%, above the plan. Keep the cap fixed even when the setup looks clean.",
        psychology: "Hesitation appeared after an early trigger. Waiting for confirmation would reduce second-guessing.",
        chartRead: "Deviation was valid, but confirmation timing was imperfect.",
        nextStep: "Add a hard pre-entry checkbox for reclaim failure confirmation.",
      },
    },
  ],
};

export function parseRules(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((rule) => rule.trim())
    .filter(Boolean);
}

export function calculateOutcomeR(input: TradeInput): number {
  const risk = Math.abs(input.entry - input.stopLoss);
  if (!Number.isFinite(risk) || risk === 0) return 0;
  const pnl = input.side === "Long" ? input.exit - input.entry : input.entry - input.exit;
  return Number((pnl / risk).toFixed(2));
}

export function calculateRewardRatio(input: TradeInput): number {
  const risk = Math.abs(input.entry - input.stopLoss);
  if (!Number.isFinite(risk) || risk === 0) return 0;
  const reward = Math.abs(input.takeProfit - input.entry);
  return Number((reward / risk).toFixed(2));
}

export function buildReview(input: TradeInput, strategy: Strategy): TradeReview {
  const riskOk = input.riskPercent <= strategy.riskPercent;
  const rewardRatio = calculateRewardRatio(input);
  const rrOk = rewardRatio >= strategy.rewardRatio;
  const hasUsefulNotes = input.notes.trim().length >= 60;
  const outcomeR = calculateOutcomeR(input);
  const score = Math.min(100, 42 + (riskOk ? 24 : 0) + (rrOk ? 18 : 0) + (hasUsefulNotes ? 16 : 4));

  const followed = [
    riskOk ? `Risk stayed within ${strategy.riskPercent}%` : "Trade had a defined risk value",
    rrOk ? `Planned reward ratio ${rewardRatio}R met the ${strategy.rewardRatio}R target` : "Reward target was documented",
    hasUsefulNotes ? "Journal notes included decision context" : "Basic notes were captured",
  ];

  const violated = [
    !riskOk ? `Risk ${input.riskPercent}% exceeded the ${strategy.riskPercent}% cap` : "",
    !rrOk ? `Planned reward ratio ${rewardRatio}R missed the ${strategy.rewardRatio}R target` : "",
    !hasUsefulNotes ? "Notes need more detail about setup, trigger, and emotion" : "",
  ].filter(Boolean);

  return {
    score,
    outcomeR,
    summary:
      score >= 85
        ? "High-quality execution. The trade followed the strategy and protected process discipline."
        : score >= 70
          ? "Useful trade with coachable process gaps. Tighten the pre-entry checklist before scaling."
          : "Process risk detected. Treat this as a review trade and reduce size until rules are followed.",
    followed,
    violated,
    riskFeedback: riskOk
      ? `Risk was ${input.riskPercent}%, inside the strategy cap.`
      : `Risk was ${input.riskPercent}%, above the ${strategy.riskPercent}% strategy cap.`,
    psychology:
      input.emotion === "Patient"
        ? "Patient execution supports consistent decision quality."
        : `${input.emotion} appeared in the journal. Name the feeling before entering next time.`,
    chartRead: `The ${input.symbol} ${strategy.timeframe} review should focus on structure confirmation, invalidation clarity, and whether entry respected the strategy trigger.`,
    nextStep: violated.length
      ? "Fix the violated rule before the next trade and keep size at baseline."
      : "Repeat this playbook for three more trades before changing risk.",
  };
}

export function createStrategy(input: StrategyInput): Strategy {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    market: input.market,
    timeframe: input.timeframe,
    riskPercent: input.riskPercent,
    rewardRatio: input.rewardRatio,
    entryRules: parseRules(input.entryRules),
    exitRules: parseRules(input.exitRules),
    status: input.status,
    version: input.status === "published" ? 1 : 0,
    updatedAt: new Date().toISOString(),
  };
}

export function createTrade(input: TradeInput, strategy: Strategy): Trade {
  return {
    id: crypto.randomUUID(),
    ...input,
    review: buildReview(input, strategy),
  };
}

export function deriveMetrics(state: TradeMentorState): MetricSet {
  const tradeCount = state.trades.length;
  const averageScore = tradeCount
    ? Math.round(state.trades.reduce((sum, trade) => sum + trade.review.score, 0) / tradeCount)
    : 0;
  const averageOutcomeR = tradeCount
    ? Number((state.trades.reduce((sum, trade) => sum + trade.review.outcomeR, 0) / tradeCount).toFixed(2))
    : 0;
  const adherenceRate = tradeCount
    ? Math.round((state.trades.filter((trade) => trade.review.violated.length === 0).length / tradeCount) * 100)
    : 0;
  const challengeBonus = deriveChallenges(state).reduce((sum, challenge) => sum + challenge.progress, 0) / 8;

  return {
    strategyCount: state.strategies.length,
    tradeCount,
    averageScore,
    averageOutcomeR,
    adherenceRate,
    reputation: Math.round(averageScore * 0.7 + adherenceRate * 0.2 + challengeBonus),
  };
}

export function deriveChallenges(state: TradeMentorState): ChallengeProgress[] {
  const riskControlled = state.trades.filter((trade) => {
    const strategy = state.strategies.find((item) => item.id === trade.strategyId);
    return strategy ? trade.riskPercent <= strategy.riskPercent : false;
  }).length;
  const perfectExecution = state.trades.filter((trade) => trade.review.violated.length === 0).length;
  const detailedReviews = state.trades.filter((trade) => trade.notes.trim().length >= 80).length;

  const items = [
    {
      id: "risk-control",
      title: "Risk Control Sprint",
      description: "Complete 10 trades within your defined risk percentage.",
      current: riskControlled,
      target: 10,
    },
    {
      id: "perfect-execution",
      title: "Rule Adherence Streak",
      description: "Complete 5 trades without any strategy-rule violations.",
      current: perfectExecution,
      target: 5,
    },
    {
      id: "deep-review",
      title: "Journal Clarity",
      description: "Write 3 detailed post-trade reviews with psychology notes.",
      current: detailedReviews,
      target: 3,
    },
  ];

  return items.map((item) => ({
    ...item,
    progress: Math.min(100, Math.round((item.current / item.target) * 100)),
  }));
}

export function deriveWeeklyReport(state: TradeMentorState): WeeklyReport {
  const metrics = deriveMetrics(state);
  const latest = state.trades[0];

  return {
    headline:
      metrics.tradeCount === 0
        ? "Start by logging one completed trade."
        : `${metrics.averageScore}/100 average process score across ${metrics.tradeCount} trades.`,
    insight:
      metrics.adherenceRate >= 70
        ? "Strategy adherence is the current strength. Keep the same checklist visible before entry."
        : "The main improvement area is rule adherence. One violated rule per trade is enough to cap size.",
    riskNote:
      metrics.averageOutcomeR >= 1.5
        ? "Reward profile is healthy. Protect it by keeping invalidation clear."
        : "Average R is low. Recheck target distance before entering new positions.",
    psychologyNote: latest
      ? `Most recent emotion logged: ${latest.emotion}. Use that label as a pause cue before the next setup.`
      : "No psychology patterns yet. Add emotion notes with every trade.",
  };
}
