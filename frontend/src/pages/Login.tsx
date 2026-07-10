import { ArrowRight, ShieldCheck, Wallet } from "lucide-react";
import { Navigate, Link } from "react-router-dom";
import { useWallet } from "../contexts/useWallet";

export function Login() {
  const { connect, isConnected, isConnecting, error, publicKey, network } = useWallet();

  if (isConnected) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="hero-panel w-full max-w-md p-6 sm:p-7">
        <Link to="/" className="mb-6 inline-flex items-center text-sm font-bold text-[var(--color-muted)]">
          Back to overview
        </Link>

        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
          <Wallet size={22} />
        </div>
        <h1 className="text-3xl font-black text-[var(--color-ink)]">Enter TradeMentor</h1>
        <p className="mt-3 text-[var(--color-muted)]">
          Connect Freighter if it is installed. Otherwise, the app opens a local demo wallet so you
          can test the full workspace immediately.
        </p>

        <button
          type="button"
          className="btn btn-primary mt-7 w-full"
          onClick={connect}
          disabled={isConnecting}
          data-testid="connect-wallet"
        >
          {isConnecting ? "Connecting..." : "Connect or enter demo"} <ArrowRight size={17} />
        </button>

        {error && <div className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

        <div className="mt-6 rounded-md border border-[var(--color-border)] bg-white p-4">
          <div className="mb-3 flex items-center gap-2 font-black text-[var(--color-ink)]">
            <ShieldCheck size={17} className="text-[var(--color-primary)]" /> Session preview
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[var(--color-muted)]">Wallet</dt>
              <dd className="max-w-48 truncate font-bold">{publicKey ?? "Demo ready"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-[var(--color-muted)]">Network</dt>
              <dd className="font-bold">{network ?? "TESTNET"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
