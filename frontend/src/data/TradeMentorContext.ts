import { createContext } from "react";
import type {
  ChallengeProgress,
  MetricSet,
  StrategyInput,
  TradeInput,
  TradeMentorState,
  WeeklyReport,
} from "./types";

export interface TradeMentorContextType {
  state: TradeMentorState;
  loading: boolean;
  error: string | null;
  metrics: MetricSet;
  challenges: ChallengeProgress[];
  weeklyReport: WeeklyReport;
  addStrategy: (input: StrategyInput) => Promise<void>;
  addTrade: (input: TradeInput) => Promise<void>;
  refreshStrategies: () => Promise<void>;
  refreshTrades: () => Promise<void>;
  resetDemo: () => void;
  clearWorkspace: () => void;
}

export const TradeMentorContext = createContext<TradeMentorContextType | null>(null);