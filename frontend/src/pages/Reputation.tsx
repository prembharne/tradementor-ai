import { Medal, ShieldCheck, Star, TrendingUp } from "lucide-react";
import { useTradeMentor } from "../data/useTradeMentor";

export function Reputation() {
  const { metrics, challenges } = useTradeMentor();
  const signals = [
    { label: "Process score", value: metrics.averageScore, icon: Star },
    { label: "Adherence", value: metrics.adherenceRate, icon: ShieldCheck },
    { label: "Average R", value: metrics.averageOutcomeR, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <section className="hero-panel p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="kicker">Decentralized reputation</p>
            <h2 className="page-title mt-2">Score discipline before performance claims.</h2>
            <p className="mt-2 text-[var(--color-muted)]">
              Reputation is derived from process score, rule adherence, and challenge completion. This local score is ready to be mirrored to Soroban later.
            </p>
          </div>
          <div className="surface p-6 text-center">
            <Medal size={34} className="mx-auto text-[var(--color-primary)]" />
            <p className="mt-4 text-7xl font-black text-[var(--color-ink)]">{metrics.reputation}</p>
            <p className="text-sm font-bold text-[var(--color-muted)]">current reputation score</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <article key={signal.label} className="metric-card p-5">
              <span className="icon-box"><Icon size={19} /></span>
              <p className="mt-4 text-sm font-black text-[var(--color-muted)]">{signal.label}</p>
              <p className="mt-1 text-4xl font-black">{signal.value}</p>
            </article>
          );
        })}
      </section>

      <section className="surface p-5">
        <p className="kicker">Challenge contribution</p>
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
      </section>
    </div>
  );
}
