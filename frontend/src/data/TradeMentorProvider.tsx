import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TradeMentorContext } from "./TradeMentorContext";
import type { StrategyInput, TradeInput, TradeMentorState } from "./types";
import {
  createStrategy,
  createTrade,
  demoState,
  deriveChallenges,
  deriveMetrics,
  deriveWeeklyReport,
} from "./calculations";

const STORAGE_KEY = "tradementor.ai.workspace.v1";

function loadState(): TradeMentorState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoState;
    const parsed = JSON.parse(raw) as TradeMentorState;
    if (!Array.isArray(parsed.strategies) || !Array.isArray(parsed.trades)) return demoState;
    return parsed;
  } catch {
    return demoState;
  }
}

function persist(nextState: TradeMentorState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export function TradeMentorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TradeMentorState>(() => loadState());

  const updateState = (nextState: TradeMentorState) => {
    setState(nextState);
    persist(nextState);
  };

  const addStrategy = (input: StrategyInput) => {
    const strategy = createStrategy(input);
    updateState({ ...state, strategies: [strategy, ...state.strategies] });
  };

  const addTrade = (input: TradeInput) => {
    const strategy = state.strategies.find((item) => item.id === input.strategyId) ?? state.strategies[0];
    if (!strategy) return;
    const trade = createTrade(input, strategy);
    updateState({ ...state, trades: [trade, ...state.trades] });
  };

  const resetDemo = () => updateState(demoState);
  const clearWorkspace = () => updateState({ strategies: [], trades: [] });

  const metrics = useMemo(() => deriveMetrics(state), [state]);
  const challenges = useMemo(() => deriveChallenges(state), [state]);
  const weeklyReport = useMemo(() => deriveWeeklyReport(state), [state]);

  return (
    <TradeMentorContext.Provider
      value={{
        state,
        metrics,
        challenges,
        weeklyReport,
        addStrategy,
        addTrade,
        resetDemo,
        clearWorkspace,
      }}
    >
      {children}
    </TradeMentorContext.Provider>
  );
}
