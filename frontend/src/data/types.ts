export type TradeSide = "Long" | "Short";
export type StrategyStatus = "draft" | "published";

export interface Strategy {
  id: string;
  name: string;
  market: string;
  timeframe: string;
  riskPercent: number;
  rewardRatio: number;
  entryRules: string[];
  exitRules: string[];
  status: StrategyStatus;
  version: number;
  updatedAt: string;
}

export interface TradeReview {
  score: number;
  outcomeR: number;
  summary: string;
  followed: string[];
  violated: string[];
  riskFeedback: string;
  psychology: string;
  chartRead: string;
  nextStep: string;
}

export interface Trade {
  id: string;
  strategyId: string;
  symbol: string;
  side: TradeSide;
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  date: string;
  notes: string;
  emotion: string;
  review: TradeReview;
}

export interface TradeMentorState {
  strategies: Strategy[];
  trades: Trade[];
}

export interface StrategyInput {
  name: string;
  market: string;
  timeframe: string;
  riskPercent: number;
  rewardRatio: number;
  entryRules: string;
  exitRules: string;
  status: StrategyStatus;
}

export interface TradeInput {
  strategyId: string;
  symbol: string;
  side: TradeSide;
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  date: string;
  notes: string;
  emotion: string;
}

export interface MetricSet {
  strategyCount: number;
  tradeCount: number;
  averageScore: number;
  averageOutcomeR: number;
  adherenceRate: number;
  reputation: number;
}

export interface ChallengeProgress {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  progress: number;
}

export interface WeeklyReport {
  headline: string;
  insight: string;
  riskNote: string;
  psychologyNote: string;
}
