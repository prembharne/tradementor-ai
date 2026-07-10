import { CheckCircle2, Trophy } from "lucide-react";
import { useTradeMentor } from "../data/useTradeMentor";

export function Challenges() {
  const { challenges } = useTradeMentor();

  return (
    <div className="space-y-6">
      <section>
        <p className="kicker">Discipline challenges</p>
        <h2 className="page-title mt-2">Reward repeatable habits, not profit claims.</h2>
        <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
          These challenges update from your local trade history. In production, completion proofs are submitted to Soroban.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <article key={challenge.id} className="surface p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <span className="icon-box"><Trophy size={19} /></span>
              <span className={challenge.progress >= 100 ? "badge badge-success" : "badge badge-neutral"}>
                {challenge.progress >= 100 ? "Complete" : "In progress"}
              </span>
            </div>
            <h3 className="text-xl font-black">{challenge.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{challenge.description}</p>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-black">
                <span>{challenge.current}/{challenge.target}</span>
                <span>{challenge.progress}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${challenge.progress}%` }} /></div>
            </div>
          </article>
        ))}
      </section>

      <section className="hero-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="kicker">On-chain path</p>
            <h3 className="mt-1 text-2xl font-black">Ready for Soroban proof submission.</h3>
            <p className="mt-2 text-[var(--color-muted)]">
              The UI now computes challenge progress deterministically. The next backend phase can submit completed proofs to the contract layer.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {['Evaluate trades', 'Submit proof', 'Update reputation'].map((item) => (
              <div key={item} className="rounded-md bg-white p-4 font-black text-[var(--color-ink)]">
                <CheckCircle2 size={18} className="mb-3 text-[var(--color-primary)]" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
