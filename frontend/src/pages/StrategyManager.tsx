import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, Plus, Rocket } from "lucide-react";
import type { StrategyInput } from "../data/types";
import { useTradeMentor } from "../data/useTradeMentor";

const initialForm: StrategyInput = {
  name: "",
  market: "BTCUSDT",
  timeframe: "15m",
  riskPercent: 1,
  rewardRatio: 2,
  entryRules: "",
  exitRules: "",
  status: "published",
};

export function StrategyManager() {
  const { state, addStrategy } = useTradeMentor();
  const [form, setForm] = useState<StrategyInput>(initialForm);

  const update = <K extends keyof StrategyInput>(key: K, value: StrategyInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.entryRules.trim() || !form.exitRules.trim()) return;
    addStrategy(form);
    setForm(initialForm);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Strategy manager</p>
          <h2 className="page-title mt-2">Version the rules before the trade.</h2>
          <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
            Every review compares execution to your own market, timeframe, risk, entry, and exit rules.
          </p>
        </div>
        <span className="badge badge-success"><Rocket size={14} /> {state.strategies.length} playbooks</span>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="surface p-5" onSubmit={submit}>
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-box"><Plus size={18} /></span>
            <div>
              <h3 className="text-lg font-black">Create strategy</h3>
              <p className="text-sm text-[var(--color-muted)]">Stored locally and ready for trade review.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              <span className="label">Name</span>
              <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="NY session breakout" />
            </label>
            <label>
              <span className="label">Market</span>
              <input className="input" value={form.market} onChange={(e) => update("market", e.target.value)} />
            </label>
            <label>
              <span className="label">Timeframe</span>
              <select className="select" value={form.timeframe} onChange={(e) => update("timeframe", e.target.value)}>
                {['5m', '15m', '1h', '4h', '1D'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="label">Risk percent</span>
              <input className="input" type="number" min="0.1" step="0.1" value={form.riskPercent} onChange={(e) => update("riskPercent", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Minimum R:R</span>
              <input className="input" type="number" min="0.5" step="0.1" value={form.rewardRatio} onChange={(e) => update("rewardRatio", Number(e.target.value))} />
            </label>
            <label>
              <span className="label">Status</span>
              <select className="select" value={form.status} onChange={(e) => update("status", e.target.value as StrategyInput["status"])}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label className="full-span">
              <span className="label">Entry rules</span>
              <textarea className="textarea" value={form.entryRules} onChange={(e) => update("entryRules", e.target.value)} placeholder="One rule per line" />
            </label>
            <label className="full-span">
              <span className="label">Exit rules</span>
              <textarea className="textarea" value={form.exitRules} onChange={(e) => update("exitRules", e.target.value)} placeholder="One rule per line" />
            </label>
          </div>

          <button type="submit" className="btn btn-primary mt-5 w-full" data-testid="save-strategy">
            Save strategy
          </button>
        </form>

        <div className="space-y-4">
          {state.strategies.map((strategy) => (
            <article key={strategy.id} className="surface p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-black">{strategy.name}</h3>
                    <span className={strategy.status === "published" ? "badge badge-success" : "badge badge-neutral"}>
                      {strategy.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {strategy.market} - {strategy.timeframe} - v{strategy.version || 1}
                  </p>
                </div>
                <span className="badge badge-neutral">Risk {strategy.riskPercent}% / {strategy.rewardRatio}R</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 font-black">Entry rules</p>
                  <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                    {strategy.entryRules.map((rule) => <li key={rule} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 text-[var(--color-primary)]" />{rule}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 font-black">Exit rules</p>
                  <ul className="space-y-2 text-sm text-[var(--color-muted)]">
                    {strategy.exitRules.map((rule) => <li key={rule} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 text-[var(--color-secondary)]" />{rule}</li>)}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
