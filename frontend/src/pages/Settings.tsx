import { Database, RefreshCcw, ShieldCheck, Trash2, Wallet } from "lucide-react";
import { useTradeMentor } from "../data/useTradeMentor";
import { useWallet } from "../contexts/useWallet";

export function Settings() {
  const { publicKey, network, disconnect } = useWallet();
  const { resetDemo, clearWorkspace, metrics } = useTradeMentor();

  return (
    <div className="space-y-6">
      <section>
        <p className="kicker">Settings</p>
        <h2 className="page-title mt-2">Control the local MVP workspace.</h2>
        <p className="mt-2 max-w-3xl text-[var(--color-muted)]">
          Demo data is stored in your browser. Reset it any time while testing the product flow.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-box"><Wallet size={18} /></span>
            <div>
              <h3 className="text-lg font-black">Wallet session</h3>
              <p className="text-sm text-[var(--color-muted)]">Freighter or local demo wallet.</p>
            </div>
          </div>
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-[var(--color-muted)]">Public key</dt>
              <dd className="max-w-64 truncate font-black">{publicKey ?? "Not connected"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-[var(--color-muted)]">Network</dt>
              <dd className="font-black">{network ?? "Unknown"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-bold text-[var(--color-muted)]">Reputation</dt>
              <dd className="font-black">{metrics.reputation}</dd>
            </div>
          </dl>
          <button type="button" className="btn btn-danger mt-5" onClick={disconnect}>
            <Trash2 size={16} /> Disconnect wallet
          </button>
        </article>

        <article className="surface p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="icon-box"><Database size={18} /></span>
            <div>
              <h3 className="text-lg font-black">Workspace data</h3>
              <p className="text-sm text-[var(--color-muted)]">Local strategies, trades, reviews, and progress.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn btn-secondary" onClick={resetDemo}>
              <RefreshCcw size={16} /> Restore demo
            </button>
            <button type="button" className="btn btn-danger" onClick={clearWorkspace}>
              <Trash2 size={16} /> Clear workspace
            </button>
          </div>
          <div className="mt-5 rounded-md bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
            <ShieldCheck size={16} className="mr-2 inline" /> No secrets are stored by this local MVP.
          </div>
        </article>
      </section>
    </div>
  );
}
