import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { BrainCircuit, CheckCircle2, ClipboardPlus, XCircle } from "lucide-react";
import type { TradeInput, TradeSide } from "../data/types";
import { useTradeMentor } from "../data/useTradeMentor";

const today = new Date().toISOString().slice(0, 10);

function emptyTrade(strategyId: string): TradeInput {
  return {
    strategyId,
    symbol: "BTCUSDT",
    side: "Long",
    entry: 64000,
    exit: 64800,
    stopLoss: 63600,
    takeProfit: 65000,
    riskPercent: 1,
    date: today,
    notes: "",
    emotion: "Patient",
  };
}

export function TradeJournal() {
  const { state, addTrade } = useTradeMentor();
  const firstStrategy = state.strategies[0]?.id ?? "";
  const [form, setForm] = useState<TradeInput>(() => emptyTrade(firstStrategy));

  const selectedStrategy = useMemo(
    () => state.strategies.find((strategy) => strategy.id === form.strategyId),
    [form.strategyId, state.strategies],
  );

  const update = <K extends keyof TradeInput>(key: K, value: TradeInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.strategyId || !form.notes.trim()) return;
    addTrade(form);
    setForm(emptyTrade(form.strategyId));
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Intelligent journal</p>
          <h2 className="page-title mt-2">Log the trade, then grade the process.</h2>
          <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
            The local coach compares each trade against the selected strategy and turns notes into actionable feedback.
          </p>
        </div>
        <span className="badge badge-success"><BrainCircuit size={14} /> {state.trades.length} reviewed</span>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="surface p-5" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-box"><ClipboardPlus size={18} /></span>
            <div>
              <h3 className="text-lg font-black">Log completed trade</h3>
              <p className="text-sm text-[var(--color-muted)]">A review is generated immediately after save.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="full-span">
              <span className="label">Strategy</span>
              <select className="select" value={form.strategyId} onChange={(e) => update("strategyId", e.target.value)} disabled={!state.strategies.length}>
                {state.strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Symbol</span>
              <input className="input" value={form.symbol} onChange={(e) => update("symbol", e.target.value.toUpperCase())} />
            </label>
            <label>
              <span className="label">Side</span>
              <select className="select" value={form.side} onChange={(e) => update("side", e.target.value as TradeSide)}>
                <option>Long</option>
                <option>Short</option>
              </select>
            </label>
            <label>
              <span className="label">Entry</span>
              <input className="input" type="number" value={form.entry} onChange={(e) => update("entry", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Exit</span>
              <input className="input" type="number" value={form.exit} onChange={(e) => update("exit", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Stop loss</span>
              <input className="input" type="number" value={form.stopLoss} onChange={(e) => update("stopLoss", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Take profit</span>
              <input className="input" type="number" value={form.takeProfit} onChange={(e) => update("takeProfit", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Risk percent</span>
              <input className="input" type="number" step="0.1" min="0.1" value={form.riskPercent} onChange={(e) => update("riskPercent", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Date</span>
              <input className="input" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
            </label>
            <label>
              <span className="label">Emotion</span>
              <select className="select" value={form.emotion} onChange={(e) => update("emotion", e.target.value)}>
                {['Patient', 'Confident', 'Hesitant', 'FOMO', 'Revenge', 'Overconfident'].map((emotion) => <option key={emotion}>{emotion}</option>)}
              </select>
            </label>
            <label className="full-span">
              <span className="label">Notes</span>
              <textarea className="textarea" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Describe setup, trigger, invalidation, emotion, and management." />
            </label>
          </div>
          <button type="submit" className="btn btn-primary mt-5 w-full" disabled={!selectedStrategy} data-testid="save-trade">
            Save and review trade
          </button>
        </form>

        <div className="space-y-4">
          {state.trades.map((trade) => (
            <article key={trade.id} className="surface p-5" data-testid="trade-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black">{trade.symbol} {trade.side}</h3>
                    <span className={trade.review.score >= 85 ? "badge badge-success" : trade.review.score >= 70 ? "badge badge-warning" : "badge badge-danger"}>
                      {trade.review.score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{trade.date} - {trade.review.outcomeR}R outcome</p>
                </div>
                <span className="badge badge-neutral">Risk {trade.riskPercent}%</span>
              </div>

              <p className="mt-4 rounded-md bg-slate-50 p-4 text-sm font-semibold text-[var(--color-muted)]">{trade.review.summary}</p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-black">Followed</p>
                  <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                    {trade.review.followed.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 text-[var(--color-success)]" />{item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-black">Violations</p>
                  {trade.review.violated.length ? (
                    <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                      {trade.review.violated.map((item) => <li key={item} className="flex gap-2"><XCircle size={15} className="mt-0.5 text-[var(--color-danger)]" />{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-sm text-[var(--color-muted)]">No strategy violations detected.</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {[trade.review.riskFeedback, trade.review.psychology, trade.review.nextStep].map((item) => (
                  <div key={item} className="rounded-md border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-muted)]">{item}</div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
