import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { 
  BrainCircuit, 
  CheckCircle2, 
  ClipboardPlus, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Zap,
  Target, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import type { TradeInput, TradeSide } from "../data/types";
import { useTradeMentor } from "../data/useTradeMentor";

const today = new Date().toISOString().slice(0, 10);

async function fetchLivePrice(symbol: string): Promise<number | null> {
  const clean = symbol.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${clean}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.price) return parseFloat(data.price);
    }
  } catch {
    // Fallback
  }

  try {
    const symbolMap: Record<string, string> = {
      BTCUSDT: "bitcoin",
      BTC: "bitcoin",
      ETHUSDT: "ethereum",
      ETH: "ethereum",
      SOLUSDT: "solana",
      SOL: "solana",
      XRPUSDT: "ripple",
      XLMUSDT: "stellar",
    };
    const assetId = symbolMap[clean] || "bitcoin";
    const res = await fetch(`https://api.coincap.io/v2/assets/${assetId}`);
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.priceUsd) return parseFloat(data.data.priceUsd);
    }
  } catch {
    // Fallback
  }
  return null;
}

export function TradeJournal() {
  const { state, addTrade } = useTradeMentor();
  const firstStrategy = state.strategies[0]?.id ?? "";
  
  const [strategyId, setStrategyId] = useState(firstStrategy);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [side, setSide] = useState<TradeSide>("Long");
  const [slPoints, setSlPoints] = useState<number>(500);
  const [tpPoints, setTpPoints] = useState<number>(1250);
  const [outcome, setOutcome] = useState<"tp" | "sl" | "be">("tp");
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [date, setDate] = useState<string>(today);
  const [emotion, setEmotion] = useState<string>("Patient");
  const [notes, setNotes] = useState<string>("Waited for 15m candle close above session resistance. Entered on retest with defined 500pt risk.");
  
  const [livePrice, setLivePrice] = useState<number>(80000);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGradingGuide, setShowGradingGuide] = useState(false);

  // Auto-fetch live market price
  useEffect(() => {
    let isMounted = true;
    const getPrice = async () => {
      setFetchingPrice(true);
      const price = await fetchLivePrice(symbol);
      if (isMounted && price) {
        setLivePrice(Math.round(price));
      }
      if (isMounted) setFetchingPrice(false);
    };
    getPrice();
    const interval = setInterval(getPrice, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  // Set default strategy when strategies load
  useEffect(() => {
    if (!strategyId && state.strategies.length > 0) {
      setStrategyId(state.strategies[0].id);
    }
  }, [state.strategies, strategyId]);

  const selectedStrategy = useMemo(
    () => state.strategies.find((s) => s.id === strategyId) || state.strategies[0],
    [strategyId, state.strategies],
  );

  // Calculated Points & R:R Metrics
  const plannedRR = slPoints > 0 ? (tpPoints / slPoints).toFixed(2) : "0.00";
  const realizedR = outcome === "tp" ? (tpPoints / slPoints).toFixed(2) : outcome === "sl" ? "-1.00" : "0.00";
  const realizedPoints = outcome === "tp" ? tpPoints : outcome === "sl" ? -slPoints : 0;

  const applyPointsPreset = (sl: number, rr: number) => {
    setSlPoints(sl);
    setTpPoints(Math.round(sl * rr));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const effectiveStrategyId = strategyId || selectedStrategy?.id || "strat_default";
    const effectiveNotes = notes.trim() || "Followed execution checklist and managed risk strictly according to strategy.";

    setIsSubmitting(true);
    try {
      const isLong = side === "Long";
      const entry = livePrice || 80000;
      const stopLoss = isLong ? entry - slPoints : entry + slPoints;
      const takeProfit = isLong ? entry + tpPoints : entry - tpPoints;
      const exit = outcome === "tp" ? takeProfit : outcome === "sl" ? stopLoss : entry;

      const payload: TradeInput = {
        strategyId: effectiveStrategyId,
        symbol: (symbol || "BTCUSDT").toUpperCase(),
        side,
        entry,
        exit,
        stopLoss,
        takeProfit,
        riskPercent: riskPercent || 1,
        date,
        notes: effectiveNotes,
        emotion,
      };

      await addTrade(payload);
    } catch (e) {
      console.error("Trade submit error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Intelligent journal & AI coach</p>
          <h2 className="page-title mt-2">Log the trade, then grade the process.</h2>
          <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
            Define your Stop Loss (SL) and Take Profit (TP) points. The AI compares execution against your defined rules, risk cap, and points distance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowGradingGuide(!showGradingGuide)}
            className="btn btn-neutral text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle size={14} /> How AI Grades Trades
          </button>
          <span className="badge badge-success flex items-center gap-1 font-bold">
            <BrainCircuit size={14} /> {state.trades.length} Reviewed
          </span>
        </div>
      </section>

      {/* AI Grading Criteria Explanation Modal / Dropdown */}
      {showGradingGuide && (
        <section className="surface p-5 border-2 border-[var(--color-primary)] bg-orange-50/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono-brutal text-xs font-black uppercase text-[#FF4D00]">
              <Sparkles size={16} />
              <span>How AI Evaluates & Grades Your Trade</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGradingGuide(false)}
              className="text-xs font-bold text-neutral-500 hover:text-black cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="bg-white p-3.5 rounded border border-black/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span>1. Rule Adherence</span>
                <span className="text-[#FF4D00]">40% Weight</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Compares entry/exit triggers from your notes against the strategy's playbook rules.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded border border-black/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span>2. Risk Management</span>
                <span className="text-[#FF4D00]">30% Weight</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Checks that risk % (e.g. 1%) remained under the strategy cap and SL was strictly respected.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded border border-black/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span>3. Planned vs Realized R:R</span>
                <span className="text-[#FF4D00]">15% Weight</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Verifies if planned points distance met the minimum R:R threshold (e.g. 1:2 R:R).
              </p>
            </div>

            <div className="bg-white p-3.5 rounded border border-black/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs">
                <span>4. Psychology & Discipline</span>
                <span className="text-[#FF4D00]">15% Weight</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Scans emotional state and written reflections for FOMO, revenge trading, or discipline.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Main Trade Form and Review Cards */}
      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <form className="surface p-5 space-y-4" onSubmit={submit}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="icon-box"><ClipboardPlus size={18} /></span>
              <div>
                <h3 className="text-lg font-black text-[var(--color-ink)]">Log Completed Trade</h3>
                <p className="text-xs text-[var(--color-muted)]">TP & SL Point Distance Engine</p>
              </div>
            </div>

            {/* Live Price Stream Badge */}
            <div className="flex items-center gap-2">
              <span className="badge badge-neutral font-mono text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{symbol}:</span>
                <span className="font-bold text-black">
                  {fetchingPrice ? "Updating..." : `$${livePrice.toLocaleString("en-US")}`}
                </span>
                <Zap size={12} className="text-[#FF4D00]" />
              </span>
            </div>
          </div>

          <div className="form-grid">
            <label className="full-span">
              <span className="label">Strategy Playbook</span>
              <select 
                className="select font-bold" 
                value={strategyId} 
                onChange={(e) => setStrategyId(e.target.value)} 
                disabled={!state.strategies.length}
              >
                {state.strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>{strategy.name} ({strategy.market})</option>
                ))}
              </select>
            </label>

            <label>
              <span className="label">Symbol</span>
              <input 
                className="input font-mono uppercase font-bold" 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
              />
            </label>

            <label>
              <span className="label">Side</span>
              <select className="select font-bold" value={side} onChange={(e) => setSide(e.target.value as TradeSide)}>
                <option>Long</option>
                <option>Short</option>
              </select>
            </label>

            {/* Stop Loss (Points) */}
            <label>
              <span className="label flex items-center justify-between">
                <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-red-500" /> Stop Loss (SL Points)</span>
                <span className="text-[10px] text-red-600 font-mono font-bold">
                  {((slPoints / livePrice) * 100).toFixed(2)}% Risk
                </span>
              </span>
              <input 
                className="input font-mono font-bold text-red-700" 
                type="number" 
                step="10" 
                value={slPoints} 
                onChange={(e) => setSlPoints(Math.max(10, Number(e.target.value)))} 
                placeholder="e.g. 500 points"
              />
            </label>

            {/* Take Profit (Points) */}
            <label>
              <span className="label flex items-center justify-between">
                <span className="flex items-center gap-1"><Target size={13} className="text-green-500" /> Take Profit (TP Points)</span>
                <span className="text-[10px] text-green-600 font-mono font-bold">
                  {((tpPoints / livePrice) * 100).toFixed(2)}% Target
                </span>
              </span>
              <input 
                className="input font-mono font-bold text-green-700" 
                type="number" 
                step="10" 
                value={tpPoints} 
                onChange={(e) => setTpPoints(Math.max(10, Number(e.target.value)))} 
                placeholder="e.g. 1250 points"
              />
            </label>

            {/* Quick Points Distance Preset Buttons */}
            <div className="full-span bg-neutral-50 p-3 rounded border border-black/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-neutral-600 font-mono">Quick Distance Presets:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPointsPreset(300, 2)}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-black/15 rounded hover:bg-neutral-100 cursor-pointer"
                >
                  300pts SL • 1:2 R:R
                </button>
                <button
                  type="button"
                  onClick={() => applyPointsPreset(500, 2.5)}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-black/15 rounded hover:bg-neutral-100 cursor-pointer"
                >
                  500pts SL • 1:2.5 R:R
                </button>
                <button
                  type="button"
                  onClick={() => applyPointsPreset(1000, 3)}
                  className="px-2 py-1 text-[10px] font-mono font-bold bg-white border border-black/15 rounded hover:bg-neutral-100 cursor-pointer"
                >
                  1000pts SL • 1:3 R:R
                </button>
              </div>
            </div>

            {/* Trade Outcome Selector */}
            <div className="full-span">
              <span className="label">Trade Outcome</span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setOutcome("tp")}
                  className={`p-2.5 rounded text-xs font-bold font-mono text-center border-2 cursor-pointer transition-colors ${
                    outcome === "tp" 
                      ? "border-green-600 bg-green-50 text-green-900" 
                      : "border-black/10 bg-white text-neutral-600 hover:border-black/30"
                  }`}
                >
                  🎯 Hit TP (+{tpPoints} pts)
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome("sl")}
                  className={`p-2.5 rounded text-xs font-bold font-mono text-center border-2 cursor-pointer transition-colors ${
                    outcome === "sl" 
                      ? "border-red-600 bg-red-50 text-red-900" 
                      : "border-black/10 bg-white text-neutral-600 hover:border-black/30"
                  }`}
                >
                  🛑 Hit SL (-{slPoints} pts)
                </button>
                <button
                  type="button"
                  onClick={() => setOutcome("be")}
                  className={`p-2.5 rounded text-xs font-bold font-mono text-center border-2 cursor-pointer transition-colors ${
                    outcome === "be" 
                      ? "border-blue-600 bg-blue-50 text-blue-900" 
                      : "border-black/10 bg-white text-neutral-600 hover:border-black/30"
                  }`}
                >
                  ⚖️ Breakeven (0 pts)
                </button>
              </div>
            </div>

            <label>
              <span className="label">Risk Percent</span>
              <input className="input font-mono" type="number" step="0.1" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))} />
            </label>

            <label>
              <span className="label">Date</span>
              <input className="input font-mono" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <label className="full-span">
              <span className="label">Trader Emotion</span>
              <select className="select font-bold" value={emotion} onChange={(e) => setEmotion(e.target.value)}>
                <option>Patient</option>
                <option>Disciplined</option>
                <option>FOMO</option>
                <option>Anxious</option>
                <option>Hesitant</option>
                <option>Overconfident</option>
                <option>Revenge Trading</option>
              </select>
            </label>

            <label className="full-span">
              <span className="label">Execution Notes & Trigger Reason</span>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Describe confirmation trigger, technical setup, SL invalidation logic, and trade management."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
          </div>

          {/* Live R-Multiple & Point Summary */}
          <div className="p-3 bg-neutral-100 rounded border border-black/10 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-neutral-500">Planned R:R: </span>
              <span className="font-bold text-black">1 : {plannedRR}</span>
            </div>
            <div>
              <span className="text-neutral-500">Realized Outcome: </span>
              <span className={`font-bold ${realizedPoints >= 0 ? "text-green-600" : "text-red-600"}`}>
                {realizedPoints >= 0 ? `+${realizedPoints} pts` : `${realizedPoints} pts`} ({realizedR} R)
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary w-full cursor-pointer font-bold text-sm py-3 shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> AI Analyzing Trade Execution & Grading Process...
              </>
            ) : (
              "Save and Review Trade"
            )}
          </button>
        </form>

        {/* Right Column: AI Review & Recent Trade Cards */}
        <div className="space-y-4">
          <div className="surface p-5">
            <p className="kicker text-[#FF4D00]">Active playbook</p>
            <h3 className="mt-1 text-2xl font-black">{selectedStrategy?.name ?? "No strategy selected"}</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)] font-mono">
              {selectedStrategy ? `${selectedStrategy.market} • ${selectedStrategy.timeframe} • Cap ${selectedStrategy.riskPercent}% Risk` : "Create a strategy first"}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
              <div className="p-3 rounded bg-neutral-50 border border-black/10">
                <p className="font-bold uppercase text-[10px] text-neutral-500 font-mono">Entry Checklist</p>
                <p className="mt-1 whitespace-pre-line text-neutral-700">{selectedStrategy?.entryRules || "No rules defined"}</p>
              </div>
              <div className="p-3 rounded bg-neutral-50 border border-black/10">
                <p className="font-bold uppercase text-[10px] text-neutral-500 font-mono">Exit Checklist</p>
                <p className="mt-1 whitespace-pre-line text-neutral-700">{selectedStrategy?.exitRules || "No rules defined"}</p>
              </div>
            </div>
          </div>

          {/* Latest AI Review Card */}
          {state.trades[0]?.review ? (
            <article className="surface p-5 space-y-4 border-2 border-black">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div>
                  <span className="font-mono text-xs text-neutral-500 uppercase">
                    Latest Trade Review • {state.trades[0].symbol}
                  </span>
                  <h4 className="text-lg font-black text-[var(--color-ink)]">
                    Process Score: {state.trades[0].review.score}/100
                  </h4>
                </div>
                <span className={`text-2xl font-black px-3 py-1 rounded font-mono ${
                  state.trades[0].review.score >= 80 ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                }`}>
                  {state.trades[0].review.score >= 80 ? "A Grade" : "B Grade"}
                </span>
              </div>

              <p className="text-xs text-neutral-700 leading-relaxed font-inter">
                {state.trades[0].review.summary}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 text-xs font-mono">
                <div className="p-3 bg-green-50 rounded border border-green-200 text-green-900 space-y-1">
                  <span className="font-bold flex items-center gap-1"><CheckCircle2 size={13} className="text-green-600" /> Rules Followed</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {state.trades[0].review.followed.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-red-50 rounded border border-red-200 text-red-900 space-y-1">
                  <span className="font-bold flex items-center gap-1"><XCircle size={13} className="text-red-600" /> Plan Violations</span>
                  {state.trades[0].review.violated.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {state.trades[0].review.violated.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-green-700">Zero rule violations detected</p>
                  )}
                </div>
              </div>

              {state.trades[0].review.riskFeedback && (
                <div className="p-3 bg-neutral-50 rounded border border-black/10 text-xs space-y-1">
                  <span className="font-bold text-neutral-600 font-mono uppercase text-[10px]">Risk Assessment</span>
                  <p className="text-neutral-700 text-[11px]">{state.trades[0].review.riskFeedback}</p>
                </div>
              )}
            </article>
          ) : (
            <div className="surface p-6 text-center text-neutral-500 text-xs">
              <BrainCircuit size={28} className="mx-auto mb-2 text-[#FF4D00]" />
              <p className="font-bold text-black">No Trades Reviewed Yet</p>
              <p className="mt-1">Fill the form on the left and click "Save and Review Trade" to get real-time AI evaluation.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
