import {
  BarChart3,
  BookOpenCheck,
  ClipboardList,
  Gauge,
  LogOut,
  Medal,
  PanelLeft,
  Settings,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTradeMentor } from "../../data/useTradeMentor";
import { useWallet } from "../../contexts/useWallet";

const navItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: Gauge },
  { path: "/app/strategies", label: "Strategies", icon: ClipboardList },
  { path: "/app/journal", label: "Journal", icon: BookOpenCheck },
  { path: "/app/challenges", label: "Challenges", icon: Trophy },
  { path: "/app/reputation", label: "Reputation", icon: Medal },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export function Layout() {
  const { publicKey, network, disconnect } = useWallet();
  const { metrics } = useTradeMentor();
  const location = useLocation();
  const currentPage = navItems.find((item) => item.path === location.pathname)?.label ?? "Dashboard";
  const shortAddress = publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "Wallet";

  return (
    <div className="app-shell flex min-h-screen pb-20 lg:pb-0">
      <aside className="sidebar fixed inset-y-0 left-0 z-20 hidden w-72 flex-col lg:flex">
        <div className="border-b border-[var(--color-border)] p-5">
          <Link to="/app/dashboard" className="flex items-center gap-3">
            <span className="icon-box bg-[var(--color-primary)] text-white">
              <BarChart3 size={19} />
            </span>
            <div>
              <p className="text-lg font-black text-[var(--color-ink)]">TradeMentor AI</p>
              <p className="text-xs font-bold text-[var(--color-muted)]">Discipline operating system</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span className="icon-box">
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="badge badge-success">
                <ShieldCheck size={14} /> {network ?? "TESTNET"}
              </span>
              <span className="text-sm font-black text-[var(--color-primary)]">{metrics.reputation}</span>
            </div>
            <p className="truncate text-sm font-black text-[var(--color-ink)]">{shortAddress}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">Wallet verified for local workspace</p>
            <button type="button" className="btn btn-ghost mt-4 w-full justify-start" onClick={disconnect}>
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-72">
        <header className="topbar sticky top-0 z-10 flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="icon-box lg:hidden">
              <PanelLeft size={18} />
            </span>
            <div>
              <p className="text-xs font-black uppercase text-[var(--color-muted)]">Workspace</p>
              <h1 className="text-lg font-black text-[var(--color-ink)]">{currentPage}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="badge badge-neutral">Avg score {metrics.averageScore}</span>
            <span className="badge badge-success">Rep {metrics.reputation}</span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-7">
          <Outlet />
        </div>
      </main>

      <nav className="mobile-nav fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 px-1 py-2 lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[0.68rem] font-black ${
                  isActive ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]"
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
