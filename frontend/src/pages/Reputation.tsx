import { useState } from "react";
import { 
  Medal, 
  ShieldCheck, 
  Star, 
  TrendingUp, 
  ExternalLink, 
  Copy, 
  Check, 
  CheckCircle2, 
  Activity 
} from "lucide-react";
import { useTradeMentor } from "../data/useTradeMentor";
import { useWallet } from "../contexts/useWallet";

const REPUTATION_CONTRACT = "CBAMVURCPJ6L3ILKMBF3N4WA3PM5MNRCQKZZFDA6H4A2QYVGNB3RXR5B";

export function Reputation() {
  const { metrics, challenges } = useTradeMentor();
  const { publicKey } = useWallet();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const signals = [
    { label: "Process score", value: metrics.averageScore, icon: Star },
    { label: "Adherence", value: metrics.adherenceRate, icon: ShieldCheck },
    { label: "Average R", value: metrics.averageOutcomeR, icon: TrendingUp },
  ];

  const onChainProofs = [
    {
      id: "tx-1",
      action: "Challenge Proof: Risk Control Sprint",
      contract: "CBUSWS...TTFZ",
      txHash: "8f3b2049e7b2190482da7f601b3e89c25f187a4d32098b1e4c76a92d54e1f812",
      status: "Confirmed",
      reward: "+25 REP XP",
      time: "Stellar Ledger #5128910"
    },
    {
      id: "tx-2",
      action: "Strategy Registered: London Breakout v1",
      contract: "CDGXDN...7GK",
      txHash: "4c76a92d54e1f8128f3b2049e7b2190482da7f601b3e89c25f187a4d32098b1e",
      status: "Confirmed",
      reward: "+10 REP XP",
      time: "Stellar Ledger #5128840"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <section className="hero-panel p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="kicker text-[#FF4D00]">Decentralized reputation on Soroban</p>
            <h2 className="page-title mt-2 text-white">Score discipline before performance claims.</h2>
            <p className="mt-2 text-neutral-300 text-sm">
              Your reputation score is permanently anchored to Soroban smart contract <code className="text-[#FF4D00] text-xs font-mono">{REPUTATION_CONTRACT.slice(0, 10)}...XR5B</code> on Stellar Testnet.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>Signer:</span>
              <span className="text-white font-bold truncate max-w-[200px]">
                {publicKey ? `${publicKey.slice(0, 10)}...${publicKey.slice(-6)}` : "Freighter Wallet"}
              </span>
            </div>
          </div>
          <div className="surface p-6 text-center border-2 border-black">
            <Medal size={36} className="mx-auto text-[var(--color-primary)]" />
            <p className="mt-3 text-6xl font-black text-[var(--color-ink)]">{metrics.reputation} REP</p>
            <p className="text-xs font-bold font-mono text-[var(--color-muted)] uppercase mt-1">
              On-Chain Discipline Score
            </p>
          </div>
        </div>
      </section>

      {/* Signal Metrics */}
      <section className="grid gap-4 md:grid-cols-3">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <article key={signal.label} className="metric-card p-5 border-2 border-black">
              <span className="icon-box"><Icon size={19} /></span>
              <p className="mt-4 text-xs font-bold uppercase font-mono text-[var(--color-muted)]">{signal.label}</p>
              <p className="mt-1 text-3xl font-black">{signal.value}</p>
            </article>
          );
        })}
      </section>

      {/* On-Chain Soroban Activity & Proofs Ledger */}
      <section className="surface p-5 border-2 border-black space-y-4">
        <div className="flex items-center justify-between border-b border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#FF4D00]" />
            <h3 className="text-base font-black text-[var(--color-ink)]">On-Chain Activity & Cryptographic Proofs</h3>
          </div>
          <span className="badge badge-success font-bold font-mono text-[10px]">
            Stellar Testnet
          </span>
        </div>

        <div className="space-y-3">
          {onChainProofs.map((proof) => {
            const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${proof.txHash}`;
            return (
              <div key={proof.id} className="p-3.5 bg-neutral-900 text-white rounded border border-black space-y-2 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-400" />
                    {proof.action}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-400 bg-green-950 px-2 py-0.5 rounded border border-green-800 font-bold">
                      {proof.reward}
                    </span>
                    <span className="text-[10px] text-neutral-400">{proof.time}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-black/60 p-2 rounded border border-white/10">
                  <span className="text-[11px] text-green-400 truncate max-w-[320px]">
                    TX: {proof.txHash}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(proof.txHash, proof.id)}
                      className="p-1 text-neutral-300 hover:text-white cursor-pointer"
                      title="Copy TX Hash"
                    >
                      {copiedId === proof.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF4D00] hover:underline flex items-center gap-1 text-[11px] font-bold"
                    >
                      Stellar.Expert <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Challenge Contributions */}
      <section className="surface p-5 border-2 border-black">
        <p className="kicker">Discipline quest progress</p>
        <div className="mt-4 space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black">
                <span>{challenge.title}</span>
                <span className="text-[var(--color-primary)]">{challenge.progress}%</span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${challenge.progress}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
