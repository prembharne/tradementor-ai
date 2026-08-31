import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../../contexts/useWallet";
import { WorkspaceButton } from "./WorkspaceButton";

export function ObservatoryNav() {
  const { isConnected } = useWallet();
  const [open, setOpen] = useState(false);
  return (
    <header className="obs-nav">
      <div className="obs-shell obs-nav-inner">
        <Link to="/" className="obs-brand"><span>TM</span> TradeMentor <em>AI</em></Link>
        <nav className={open ? "is-open" : ""}>
          <a href="#observatory" onClick={() => setOpen(false)}>Observatory</a><a href="#product" onClick={() => setOpen(false)}>Modules</a><a href="#method" onClick={() => setOpen(false)}>Method</a>
          <WorkspaceButton className="obs-nav-cta">{isConnected ? "Dashboard" : "Enter workspace"}<ArrowRight size={14} /></WorkspaceButton>
        </nav>
        <button className="obs-menu" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
    </header>
  );
}
