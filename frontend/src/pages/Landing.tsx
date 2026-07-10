import { ArrowRight, BarChart3, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/useWallet";

export function Landing() {
  const { isConnected } = useWallet();

  return (
    <main className="app-shell min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:py-12">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-black text-[var(--color-primary)] shadow-sm">
            <Sparkles size={16} /> Stellar testnet discipline tracker
          </div>
          <h1 className="text-4xl font-black leading-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
            TradeMentor AI
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-[var(--color-muted)]">
            A premium trading education workspace that grades process, risk control, and strategy
            adherence. No signals. No profit promises. Just sharper decision quality.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to={isConnected ? "/app/dashboard" : "/login"} className="btn btn-primary">
              {isConnected ? "Open dashboard" : "Enter workspace"} <ArrowRight size={17} />
            </Link>
            <a href="#preview" className="btn btn-secondary">
              View product preview
            </a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["AI review", "Rule-by-rule trade coaching"],
              ["Reputation", "Discipline-weighted score"],
              ["Challenges", "Risk habits that compound"],
            ].map(([title, copy]) => (
              <div key={title} className="surface p-3">
                <p className="font-black text-[var(--color-ink)]">{title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div id="preview" className="hero-panel p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="kicker">Live workspace</p>
              <h2 className="text-xl font-black text-[var(--color-ink)]">Discipline command center</h2>
            </div>
            <span className="badge badge-success"><ShieldCheck size={14} /> Verified</span>
          </div>
          <div className="chart-grid rounded-md border border-[var(--color-border)] bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="metric-card p-4">
                <BrainCircuit size={20} className="text-[var(--color-primary)]" />
                <p className="mt-4 text-3xl font-black">82</p>
                <p className="text-sm text-[var(--color-muted)]">Avg process score</p>
              </div>
              <div className="metric-card p-4">
                <BarChart3 size={20} className="text-[var(--color-secondary)]" />
                <p className="mt-4 text-3xl font-black">2.31R</p>
                <p className="text-sm text-[var(--color-muted)]">Average outcome</p>
              </div>
              <div className="metric-card p-4">
                <ShieldCheck size={20} className="text-[var(--color-success)]" />
                <p className="mt-4 text-3xl font-black">68</p>
                <p className="text-sm text-[var(--color-muted)]">Reputation</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="surface p-4">
                <p className="font-black">AI trade review</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Strong setup. Risk stayed inside plan. Next improvement: wait for confirmation
                  before increasing size.
                </p>
                <div className="mt-4 space-y-3">
                  <div className="progress-track"><div className="progress-fill w-[92%]" /></div>
                  <div className="progress-track"><div className="progress-fill w-[71%]" /></div>
                  <div className="progress-track"><div className="progress-fill w-[48%]" /></div>
                </div>
              </div>
              <div className="surface p-4">
                <p className="font-black">Challenge</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">Risk Control Sprint</p>
                <p className="mt-6 text-4xl font-black text-[var(--color-primary)]">20%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
