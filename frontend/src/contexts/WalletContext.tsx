import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { WalletContext } from "./WalletContextCore";
import type { WalletState } from "./WalletContextCore";
import { api } from "../api/client";
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
  getNetwork as freighterGetNetwork,
  signMessage as freighterSignMessage,
  signTransaction as freighterSignTransaction,
  WatchWalletChanges,
} from "@stellar/freighter-api";

const DEMO_PUBLIC_KEY = "GDEMO7V3KXYZ2026TRADEMENTORSTELLARTESTNETKEY99999999999999";

async function fetchStellarBalance(publicKey: string, network?: string): Promise<string> {
  if (!publicKey) return "0.00 XLM";
  if (publicKey.startsWith("GDEMO")) {
    return "10,000.00 XLM";
  }
  try {
    const isTestnet = !network || network.toUpperCase().includes("TESTNET");
    const serverUrl = isTestnet
      ? "https://horizon-testnet.stellar.org"
      : "https://horizon.stellar.org";
    const res = await fetch(`${serverUrl}/accounts/${publicKey}`);
    if (!res.ok) return "0.00 XLM";
    const data = await res.json();
    const nativeBal = data.balances?.find((b: any) => b.asset_type === "native");
    if (nativeBal?.balance) {
      const num = parseFloat(nativeBal.balance);
      return `${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} XLM`;
    }
  } catch (err) {
    console.warn("Failed to fetch Stellar balance:", err);
  }
  return "0.00 XLM";
}

function loadDemoConnection(): WalletState {
  const isDemoConnected = localStorage.getItem("tradementor.demoWallet") === "connected";
  return {
    isConnected: isDemoConnected,
    publicKey: isDemoConnected ? DEMO_PUBLIC_KEY : null,
    network: isDemoConnected ? "STELLAR TESTNET" : null,
    balance: isDemoConnected ? "10,000.00 XLM" : null,
    isConnecting: false,
    error: null,
  };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => loadDemoConnection());
  const [authLoading, setAuthLoading] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const conn = await freighterIsConnected().catch(() => ({ isConnected: false }));
      const hasFreighter = typeof conn === "boolean" ? conn : conn?.isConnected;

      if (hasFreighter) {
        const addrRes = await getAddress().catch(() => ({ address: "" }));
        if (addrRes?.address) {
          const netRes = await freighterGetNetwork().catch(() => ({ network: "TESTNET" }));
          const netName = netRes?.network || "TESTNET";
          const bal = await fetchStellarBalance(addrRes.address, netName);
          setState((prev) => ({
            ...prev,
            isConnected: true,
            publicKey: addrRes.address,
            network: netName,
            balance: bal,
            error: null,
          }));
        }
      }
    } catch (error) {
      console.warn("Wallet connection check:", error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    let watcher: any = null;
    try {
      if (typeof WatchWalletChanges === "function") {
        watcher = new WatchWalletChanges(2000);
        if (typeof watcher.watch === "function") {
          watcher.watch(async () => {
            await checkConnection();
          });
        }
      }
    } catch {
      // Ignored
    }

    return () => {
      if (watcher && typeof watcher.close === "function") {
        watcher.close();
      }
    };
  }, [checkConnection]);

  // Periodic balance refresher when connected
  useEffect(() => {
    if (!state.isConnected || !state.publicKey) return;
    let isMounted = true;
    const updateBal = async () => {
      if (state.publicKey) {
        const bal = await fetchStellarBalance(state.publicKey, state.network || "TESTNET");
        if (isMounted) {
          setState((prev) => (prev.balance === bal ? prev : { ...prev, balance: bal }));
        }
      }
    };
    updateBal();
    const timer = setInterval(updateBal, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [state.isConnected, state.publicKey, state.network]);

  const connect = async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      const accessRes = await requestAccess().catch((err: any) => ({
        address: "",
        error: err?.message || "Connection rejected by user.",
      }));

      if (accessRes?.error) {
        const conn = await freighterIsConnected().catch(() => ({ isConnected: false }));
        const hasFreighter = typeof conn === "boolean" ? conn : conn?.isConnected;

        if (!hasFreighter && !accessRes.address) {
          setState((prev) => ({
            ...prev,
            isConnecting: false,
            error: "Freighter Wallet extension is not installed or enabled in your browser.",
          }));
          return false;
        }

        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: accessRes.error || "Failed to connect Freighter Wallet.",
        }));
        return false;
      }

      const publicKey = accessRes.address || (await getAddress().catch(() => ({ address: "" }))).address;

      if (!publicKey) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "No account selected in Freighter Wallet.",
        }));
        return false;
      }

      let network = "TESTNET";
      try {
        const netRes = await freighterGetNetwork();
        if (netRes && netRes.network) {
          network = netRes.network;
        }
      } catch {
        // Fallback
      }

      const balance = await fetchStellarBalance(publicKey, network);

      localStorage.removeItem("tradementor.demoWallet");
      setState({
        isConnected: true,
        publicKey,
        network,
        balance,
        isConnecting: false,
        error: null,
      });
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Failed to connect Freighter Wallet.",
      }));
      return false;
    }
  };

  const connectDemo = () => {
    localStorage.setItem("tradementor.demoWallet", "connected");
    setState({
      isConnected: true,
      publicKey: DEMO_PUBLIC_KEY,
      network: "STELLAR TESTNET",
      balance: "10,000.00 XLM",
      isConnecting: false,
      error: null,
    });
  };

  const disconnect = () => {
    localStorage.removeItem("tradementor.demoWallet");
    setState({
      isConnected: false,
      publicKey: null,
      network: null,
      balance: null,
      isConnecting: false,
      error: null,
    });
    api.clearTokens();
  };

  const signMessage = async (message: string): Promise<string> => {
    if (state.publicKey === DEMO_PUBLIC_KEY) {
      return "demo_signature";
    }
    try {
      const result = await freighterSignMessage(message);
      if (typeof result === "string") return result;
      if (result && "signedMessage" in result && result.signedMessage) {
        if (typeof result.signedMessage === "string") {
          return result.signedMessage;
        }
        return "signed_payload";
      }
      return "signed";
    } catch {
      return "demo_signature";
    }
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (state.publicKey === DEMO_PUBLIC_KEY) {
      return "demo_tx_signature";
    }
    try {
      const result = await freighterSignTransaction(xdr);
      return result?.signedTxXdr || xdr;
    } catch {
      return xdr;
    }
  };

  const loginWithBackend = async (username?: string, password?: string) => {
    if (!state.publicKey) return;
    setAuthLoading(true);
    try {
      if (username && password) {
        await api.login(state.publicKey, password);
      } else {
        await api.register(state.publicKey, username || `trader_${state.publicKey.slice(-8)}`, password || "demo123");
      }
    } catch (e) {
      console.error("Backend auth failed:", e);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        connectDemo,
        disconnect,
        signMessage,
        signTransaction,
        loginWithBackend,
        authLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}