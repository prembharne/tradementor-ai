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
  metrics: MetricSet;
  challenges: ChallengeProgress[];
  weeklyReport: WeeklyReport;
  addStrategy: (input: StrategyInput) => void;
  addTrade: (input: TradeInput) => void;
  resetDemo: () => void;
  clearWorkspace: () => void;
}

export const TradeMentorContext = createContext<TradeMentorContextType | null>(null);
