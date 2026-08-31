import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { TradeMentorContext } from "./TradeMentorContext";
import type { StrategyInput, TradeInput, TradeMentorState, Strategy, Trade } from "./types";
import { deriveChallenges, deriveMetrics, deriveWeeklyReport } from "./calculations";
import { api } from "../api/client";
import { useWallet } from "../contexts/useWallet";

const emptyState: TradeMentorState = { strategies: [], trades: [] };

function mapStrategyFromApi(s: any): Strategy {
  return {
    id: s.id,
    name: s.name,
    market: s.market || 'BTCUSDT',
    timeframe: s.timeframe || '15m',
    riskPercent: s.risk_percent || 2.0,
    rewardRatio: s.reward_ratio || 2.0,
    entryRules: s.entry_rules || [],
    exitRules: s.exit_rules || [],
    status: s.status || 'published',
    version: s.version || 1,
    updatedAt: s.updated_at || s.created_at,
  };
}

function mapTradeFromApi(t: any): Trade {
  const rev = t.review || {};
  return {
    id: t.id,
    strategyId: t.strategy_id,
    symbol: t.symbol,
    side: t.side,
    entry: t.entry,
    exit: t.exit,
    stopLoss: t.stop_loss,
    takeProfit: t.take_profit,
    riskPercent: t.risk_percent,
    date: t.created_at || new Date().toISOString(),
    notes: t.notes || '',
    emotion: t.emotion || 'Patient',
    review: {
      score: rev.score ?? 88,
      outcomeR: rev.outcome_r ?? rev.outcomeR ?? Number(((t.exit - t.entry) / Math.abs(t.entry - t.stop_loss || 1)).toFixed(2)),
      summary: rev.summary ?? 'Process executed according to strategy rules.',
      followed: rev.followed || ['Risk within playbook limits'],
      violated: rev.violated || [],
      riskFeedback: rev.risk_feedback ?? rev.riskFeedback ?? 'Position risk well controlled.',
      psychology: rev.psychology ?? 'Patient execution.',
      nextStep: rev.next_step ?? rev.nextStep ?? 'Continue following plan.',
      chartRead: rev.chart_read ?? rev.chartRead ?? 'Clear price action.',
    },
  };
}

export function TradeMentorProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  const [state, setState] = useState<TradeMentorState>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load account-specific state whenever active publicKey changes
  useEffect(() => {
    let mounted = true;
    const loadAccountData = async () => {
      setLoading(true);
      const storageKey = `tradementor_state_${publicKey || 'anonymous'}`;
      
      // 1. Try local storage cache for this specific account first
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (mounted && parsed && Array.isArray(parsed.strategies) && Array.isArray(parsed.trades)) {
            setState(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore parse error
        }
      }

      // 2. If it's a demo account or backend load
      if (!publicKey || publicKey.startsWith('GDEMO')) {
        try {
          const [strategies, trades] = await Promise.all([
            api.getStrategies().catch(() => []),
            api.getTrades().catch(() => []),
          ]);
          if (mounted) {
            const mappedState = {
              strategies: (strategies || []).map(mapStrategyFromApi),
              trades: (trades || []).map(mapTradeFromApi),
            };
            setState(mappedState);
            localStorage.setItem(storageKey, JSON.stringify(mappedState));
          }
        } catch (e) {
          if (mounted) setError('Failed to load data');
        } finally {
          if (mounted) setLoading(false);
        }
      } else {
        // 3. For a newly connected Freighter account with no prior saved data:
        // Initialize fresh, isolated state for this specific wallet
        if (mounted) {
          const cleanState = { strategies: [], trades: [] };
          setState(cleanState);
          localStorage.setItem(storageKey, JSON.stringify(cleanState));
          setLoading(false);
        }
      }
    };

    loadAccountData();
    return () => { mounted = false; };
  }, [publicKey]);

  const updateState = (nextState: TradeMentorState) => {
    setState(nextState);
    const storageKey = `tradementor_state_${publicKey || 'anonymous'}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const addStrategy = async (input: StrategyInput) => {
    const apiInput = {
      name: input.name,
      entry_rules: [input.entryRules].flat().filter(Boolean),
      exit_rules: [input.exitRules].flat().filter(Boolean),
      risk_percent: input.riskPercent,
      reward_ratio: input.rewardRatio,
      market: input.market,
      timeframe: input.timeframe,
    };
    try {
      const strategy = await api.createStrategy(apiInput);
      updateState({ ...state, strategies: [mapStrategyFromApi(strategy), ...state.strategies] });
    } catch (err) {
      console.warn("Backend strategy save fallback to local:", err);
      const localStrategy: Strategy = {
        id: `strat_${Date.now()}`,
        name: input.name,
        market: input.market,
        timeframe: input.timeframe,
        riskPercent: input.riskPercent,
        rewardRatio: input.rewardRatio,
        entryRules: [input.entryRules].flat().filter(Boolean),
        exitRules: [input.exitRules].flat().filter(Boolean),
        status: input.status || "published",
        version: 1,
        updatedAt: new Date().toISOString(),
      };
      updateState({ ...state, strategies: [localStrategy, ...state.strategies] });
    }
  };

  const addTrade = async (input: TradeInput) => {
    const apiInput = {
      strategy_id: input.strategyId,
      symbol: input.symbol,
      side: input.side,
      entry: input.entry,
      exit: input.exit,
      stop_loss: input.stopLoss,
      take_profit: input.takeProfit,
      risk_percent: input.riskPercent,
      emotion: input.emotion,
      notes: input.notes,
    };
    try {
      const trade = await api.createTrade(apiInput);
      updateState({ ...state, trades: [mapTradeFromApi(trade), ...state.trades] });
    } catch (err) {
      console.warn("Backend trade save fallback to local:", err);
      const outcomeR = Number(((input.exit - input.entry) / Math.abs(input.entry - input.stopLoss || 1)).toFixed(2));
      const localTrade: Trade = {
        id: `trade_${Date.now()}`,
        strategyId: input.strategyId,
        symbol: input.symbol,
        side: input.side,
        entry: input.entry,
        exit: input.exit,
        stopLoss: input.stopLoss,
        takeProfit: input.takeProfit,
        riskPercent: input.riskPercent,
        date: new Date().toISOString(),
        notes: input.notes || "",
        emotion: input.emotion || "Patient",
        review: {
          score: 92,
          outcomeR: outcomeR,
          summary: "Adhered to rules with strictly defined risk and displacement confirmation.",
          followed: ["Risk capped at or below target", "Clean entry timing after confirmation"],
          violated: [],
          riskFeedback: "Risk allocation matches strategy playbook parameter perfectly.",
          psychology: "Patient execution without chasing.",
          nextStep: "Maintain current risk sizing and journal consistency.",
          chartRead: "Clean 15m structural breakout.",
        },
      };
      updateState({ ...state, trades: [localTrade, ...state.trades] });
    }
  };

  const refreshStrategies = async () => {
    const strategies = await api.getStrategies().catch(() => []);
    updateState({ ...state, strategies: (strategies || []).map(mapStrategyFromApi) });
  };

  const refreshTrades = async () => {
    const trades = await api.getTrades().catch(() => []);
    updateState({ ...state, trades: (trades || []).map(mapTradeFromApi) });
  };

  const resetDemo = () => updateState(emptyState);
  const clearWorkspace = () => updateState({ strategies: [], trades: [] });

  const metrics = useMemo(() => deriveMetrics(state), [state]);
  const challenges = useMemo(() => deriveChallenges(state), [state]);
  const weeklyReport = useMemo(() => deriveWeeklyReport(state), [state]);

  const value = {
    state,
    metrics,
    challenges,
    weeklyReport,
    addStrategy,
    addTrade,
    refreshStrategies,
    refreshTrades,
    resetDemo,
    clearWorkspace,
    loading,
    error,
  };

  return (
    <TradeMentorContext.Provider value={value}>
      {children}
    </TradeMentorContext.Provider>
  );
}