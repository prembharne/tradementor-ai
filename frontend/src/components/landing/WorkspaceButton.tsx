import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../contexts/useWallet";

type WorkspaceButtonProps = {
  children: ReactNode;
  className?: string;
};

export function WorkspaceButton({ children, className = "" }: WorkspaceButtonProps) {
  const navigate = useNavigate();
  const { connect, isConnected, isConnecting, error } = useWallet();
  const [showError, setShowError] = useState(false);

  const enterWorkspace = async () => {
    setShowError(false);

    if (isConnected) {
      navigate("/app/dashboard");
      return;
    }

    const connected = await connect();
    if (connected) {
      navigate("/app/dashboard");
    } else {
      setShowError(true);
    }
  };

  return (
    <span className="obs-workspace-control">
      <button
        type="button"
        className={className}
        onClick={enterWorkspace}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting Freighter…" : children}
      </button>
      {showError && error && (
        <span className="obs-wallet-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
