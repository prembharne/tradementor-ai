import { ArrowRight, ShieldCheck, Wallet, ArrowLeft, Play } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { useWallet } from "../contexts/useWallet";

export function Login() {
  const { connect, connectDemo, isConnected, isConnecting, error, publicKey, network } = useWallet();

  if (isConnected) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <main className="min-h-screen w-full bg-[#FF4D00] text-black flex items-center justify-center px-4 py-12 selection:bg-black selection:text-[#FF4D00]">
      <div className="w-full max-w-lg bg-black text-white p-8 md:p-10 border-2 border-black shadow-[12px_12px_0px_#000000]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-mono-brutal text-xs font-bold text-[#FF4D00] hover:text-white uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Overview
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#FF4D00] text-black flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <span className="font-mono-brutal text-xs font-bold uppercase tracking-wider text-[#FF4D00]">
            AUTH GATEWAY
          </span>
        </div>

        <h1 className="font-archivo text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none mb-4">
          ENTER WORKSPACE
        </h1>

        <p className="font-inter text-sm text-neutral-300 mb-8 leading-relaxed">
          Connect your Stellar Freighter wallet to sign in with your on-chain identity. Or launch directly in Instant Demo mode.
        </p>

        <div className="flex flex-col gap-4">
          {/* Real Freighter Connect Button */}
          <button
            type="button"
            onClick={connect}
            disabled={isConnecting}
            className="w-full bg-[#FF4D00] text-black hover:bg-white transition-colors duration-200 py-4 px-6 font-mono-brutal text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-lg"
          >
            <span>{isConnecting ? "CONNECTING FREIGHTER..." : "CONNECT FREIGHTER"}</span>
            <ArrowRight size={18} className="stroke-[3]" />
          </button>

          {/* Instant Demo Mode Button */}
          <button
            type="button"
            onClick={connectDemo}
            className="w-full bg-neutral-900 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200 py-3.5 px-6 font-mono-brutal text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={14} className="fill-current" />
            <span>ENTER IN INSTANT DEMO MODE</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 border border-red-500 bg-red-950/50 p-3 font-mono-brutal text-xs text-red-400 font-bold">
            {error}
          </div>
        )}

        {/* Session Readout */}
        <div className="mt-8 border border-white/20 p-4 bg-white/[0.03]">
          <div className="flex items-center gap-2 font-mono-brutal text-xs text-[#FF4D00] font-bold mb-3 uppercase">
            <ShieldCheck size={16} /> Session Parameters
          </div>
          <div className="space-y-2 font-mono-brutal text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span>WALLET:</span>
              <span className="text-white font-bold truncate max-w-[200px]">
                {publicKey ?? "READY FOR CONNECTION"}
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400">
              <span>NETWORK:</span>
              <span className="text-white font-bold">{network ?? "STELLAR TESTNET"}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
