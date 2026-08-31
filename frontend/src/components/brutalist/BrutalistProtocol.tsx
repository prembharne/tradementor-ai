import { CheckCircle2, ShieldCheck, Zap, Terminal } from "lucide-react";

export function BrutalistProtocol() {
  const auditExample = {
    symbol: "BTCUSDT • 15M",
    verdict: "APPROVED WITH DISCIPLINE SCORE 92/100",
    checks: [
      { name: "Risk Cap ≤ 2.0%", status: "PASSED (1.5% actual)" },
      { name: "Take Profit / Stop Loss ≥ 2.0R", status: "PASSED (2.4R planned)" },
      { name: "Confirmation on 15m Timeframe", status: "PASSED (Clean breakout)" },
      { name: "Emotional State Logged", status: "PASSED (Patient)" },
    ],
  };

  return (
    <section id="protocol" className="w-full bg-[#FF4D00] text-black py-20 md:py-32 px-4 md:px-8 select-none border-t-2 border-black">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-black pb-8 mb-12">
        <div>
          <span className="font-mono-brutal text-xs font-bold uppercase tracking-wider bg-black text-[#FF4D00] px-3 py-1">
            VERIFIABLE DISCIPLINE PROTOCOL
          </span>
          <h2 className="font-archivo text-5xl sm:text-7xl md:text-[8vw] font-black uppercase tracking-tighter text-black leading-none mt-4">
            HOW IT WORKS
          </h2>
        </div>
        <p className="font-mono-brutal text-xs md:text-sm font-bold uppercase max-w-md text-black/90">
          WE DO NOT SELL SIGNALS. WE GRADE YOUR PROCESS AND PROVE YOUR TRADING DISCIPLINE ON STELLAR SOROBAN.
        </p>
      </div>

      {/* 3 Step Brutalist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
        {/* Step 1 */}
        <div className="bg-black text-white p-6 md:p-8 flex flex-col justify-between min-h-[280px] border-2 border-black hover:-translate-y-2 transition-transform duration-300 shadow-[8px_8px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between font-mono-brutal text-xs text-[#FF4D00] font-bold mb-4">
              <span>STEP 01</span>
              <Terminal size={18} />
            </div>
            <h3 className="font-archivo text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
              DEFINE PLAYBOOK
            </h3>
            <p className="font-inter text-sm text-neutral-300 font-normal leading-relaxed">
              Lock in your entry criteria, stop-loss rules, and strict risk caps. Immutable versioning guarantees no hindsight bias.
            </p>
          </div>
          <span className="font-mono-brutal text-xs uppercase text-[#FF4D00] font-bold mt-6">
            → SMART CONTRACT VAULT
          </span>
        </div>

        {/* Step 2 */}
        <div className="bg-black text-white p-6 md:p-8 flex flex-col justify-between min-h-[280px] border-2 border-black hover:-translate-y-2 transition-transform duration-300 shadow-[8px_8px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between font-mono-brutal text-xs text-[#FF4D00] font-bold mb-4">
              <span>STEP 02</span>
              <Zap size={18} />
            </div>
            <h3 className="font-archivo text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
              AI AUDITS TRADE
            </h3>
            <p className="font-inter text-sm text-neutral-300 font-normal leading-relaxed">
              Upload your chart and execution. LLMs + vision models score technical adherence, psychology, and risk management.
            </p>
          </div>
          <span className="font-mono-brutal text-xs uppercase text-[#FF4D00] font-bold mt-6">
            → MULTI-MODAL GRADER
          </span>
        </div>

        {/* Step 3 */}
        <div className="bg-black text-white p-6 md:p-8 flex flex-col justify-between min-h-[280px] border-2 border-black hover:-translate-y-2 transition-transform duration-300 shadow-[8px_8px_0px_#000000]">
          <div>
            <div className="flex items-center justify-between font-mono-brutal text-xs text-[#FF4D00] font-bold mb-4">
              <span>STEP 03</span>
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-archivo text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
              MINT REPUTATION
            </h3>
            <p className="font-inter text-sm text-neutral-300 font-normal leading-relaxed">
              Consecutive disciplined execution earns milestone proofs recorded on Stellar Soroban with a global reputation score.
            </p>
          </div>
          <span className="font-mono-brutal text-xs uppercase text-[#FF4D00] font-bold mt-6">
            → ON-CHAIN REPUTATION
          </span>
        </div>
      </div>

      {/* Live Brutalist Grader Preview Box */}
      <div className="w-full bg-black text-white p-6 md:p-10 border-2 border-black shadow-[12px_12px_0px_#000000]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/20 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FF4D00] animate-pulse" />
            <span className="font-mono-brutal text-xs md:text-sm font-bold uppercase tracking-wider text-white">
              LIVE AUDIT READOUT: {auditExample.symbol}
            </span>
          </div>
          <span className="font-mono-brutal text-xs font-bold px-3 py-1 bg-[#FF4D00] text-black uppercase">
            {auditExample.verdict}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {auditExample.checks.map((check, idx) => (
            <div key={idx} className="border border-white/20 p-4 bg-white/[0.03]">
              <div className="flex items-center gap-2 font-mono-brutal text-xs text-[#FF4D00] font-bold mb-2">
                <CheckCircle2 size={14} className="text-[#FF4D00]" />
                <span>RULE CHECK 0{idx + 1}</span>
              </div>
              <p className="font-archivo text-base text-white uppercase mb-1">{check.name}</p>
              <p className="font-mono-brutal text-xs text-white/70">{check.status}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
