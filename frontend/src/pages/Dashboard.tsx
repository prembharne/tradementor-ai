import { Activity, BarChart3, BrainCircuit, CheckCircle2, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useTradeMentor } from "../data/useTradeMentor";

export function Dashboard() {
  const { state, metrics, challenges, weeklyReport } = useTradeMentor();
  const latestTrades = state.trades.slice(0, 3);

  const cards = [
    { label: "Strategies", value: metrics.strategyCount, helper: "versioned playbooks", icon: BarChart3 },
    { label: "Trades", value: metrics.tradeCount, helper: "reviewed locally", icon: Activity },
    { label: "AI score", value: metrics.averageScore, helper: "average process grade", icon: BrainCircuit },
    { label: "Reputation", value: metrics.reputation, helper: "discipline weighted", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-panel p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="kicker">Command center</p>
            <h2 className="page-title mt-2">Build a verified trading discipline record.</h2>
            <p className="mt-3 max-w-3xl text-[var(--color-muted)]">
              The dashboard grades trade quality, strategy adherence, risk behavior, and challenge
              progress. Outcomes matter, but the app rewards process first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/app/journal" className="btn btn-primary">Log trade</Link>
              <Link to="/app/strategies" className="btn btn-secondary">Create strategy</Link>
            </div>
          </div>
          <div className="surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-[var(--color-muted)]">Average R multiple</p>
                <p className="mt-2 text-5xl font-black text-[var(--color-ink)]">{metrics.averageOutcomeR}R</p>
              </div>
              <span className="icon-box bg-emerald-50 text-[var(--color-primary)]"><TrendingUp size={22} /></span>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                <span>Adherence rate</span>
                <span>{metrics.adherenceRate}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${metrics.adherenceRate}%` }} /></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="metric-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--color-muted)]">{card.label}</p>
                  <p className="mt-2 text-4xl font-black text-[var(--color-ink)]">{card.value}</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{card.helper}</p>
                </div>
                <span className="icon-box"><Icon size={20} /></span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="surface p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="kicker">AI weekly report</p>
              <h3 className="mt-1 text-xl font-black">{weeklyReport.headline}</h3>
            </div>
            <span className="badge badge-success">Live</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[weeklyReport.insight, weeklyReport.riskNote, weeklyReport.psychologyNote].map((item) => (
              <div key={item} className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-[var(--color-muted)]">
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="surface p-5">
          <p className="kicker">Active challenges</p>
          <div className="mt-4 space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                  <span>{challenge.title}</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${challenge.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="kicker">Recent reviews</p>
            <h3 className="mt-1 text-xl font-black">Latest AI trade feedback</h3>
          </div>
          <Link to="/app/journal" className="btn btn-secondary">Open journal</Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {latestTrades.map((trade) => (
            <article key={trade.id} className="rounded-md border border-[var(--color-border)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-black">{trade.symbol}</p>
                <span className="badge badge-neutral">{trade.review.score}/100</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{trade.review.summary}</p>
              <p className="mt-4 text-sm font-black text-[var(--color-primary)]">{trade.review.outcomeR}R outcome</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
