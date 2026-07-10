import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { WalletContext } from "./WalletContextCore";
import type { WalletState } from "./WalletContextCore";

const DEMO_PUBLIC_KEY = "GDEMO7K4FQ5PZ3N8TQ2X6V9Y1A4B7C8D9E2F3G4H5J6K7L8M9N0P";

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
      connect: () => Promise<{ publicKey: string; network: string }>;
      disconnect: () => Promise<void>;
      signMessage: (message: string) => Promise<string>;
      signTransaction: (xdr: string, network: string) => Promise<string>;
      on: (event: "networkChange" | "accountChange", callback: (data: unknown) => void) => void;
      off: (event: "networkChange" | "accountChange", callback: (data: unknown) => void) => void;
    };
  }
}

function loadDemoConnection(): WalletState {
  const isDemoConnected = localStorage.getItem("tradementor.demoWallet") === "connected";
  return {
    isConnected: isDemoConnected,
    publicKey: isDemoConnected ? DEMO_PUBLIC_KEY : null,
    network: isDemoConnected ? "TESTNET" : null,
    isConnecting: false,
    error: null,
  };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => loadDemoConnection());

  const checkConnection = useCallback(async () => {
    if (!window.freighter) return;

    try {
      const isConnected = await window.freighter.isConnected();
      if (isConnected) {
        const [publicKey, network] = await Promise.all([
          window.freighter.getPublicKey(),
          window.freighter.getNetwork(),
        ]);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          publicKey,
          network,
          error: null,
        }));
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (!window.freighter) return;

    const handleNetworkChange = () => checkConnection();
    const handleAccountChange = () => checkConnection();

    window.freighter.on("networkChange", handleNetworkChange);
    window.freighter.on("accountChange", handleAccountChange);

    return () => {
      window.freighter?.off("networkChange", handleNetworkChange);
      window.freighter?.off("accountChange", handleAccountChange);
    };
  }, [checkConnection]);

  const connect = async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    if (!window.freighter) {
      localStorage.setItem("tradementor.demoWallet", "connected");
      setState({
        isConnected: true,
        publicKey: DEMO_PUBLIC_KEY,
        network: "TESTNET",
        isConnecting: false,
        error: null,
      });
      return;
    }

    try {
      const { publicKey, network } = await window.freighter.connect();
      localStorage.removeItem("tradementor.demoWallet");
      setState({
        isConnected: true,
        publicKey,
        network,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      }));
    }
  };

  const disconnect = () => {
    window.freighter?.disconnect();
    localStorage.removeItem("tradementor.demoWallet");
    setState({
      isConnected: false,
      publicKey: null,
      network: null,
      isConnecting: false,
      error: null,
    });
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!state.isConnected) {
      throw new Error("Wallet not connected");
    }
    if (!window.freighter) {
      return `demo-signature:${btoa(message).slice(0, 24)}`;
    }
    return window.freighter.signMessage(message);
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!state.isConnected) {
      throw new Error("Wallet not connected");
    }
    if (!state.network) {
      throw new Error("Network not available");
    }
    if (!window.freighter) {
      return `demo-signed-xdr:${xdr.slice(0, 24)}`;
    }
    return window.freighter.signTransaction(xdr, state.network);
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        signMessage,
        signTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
