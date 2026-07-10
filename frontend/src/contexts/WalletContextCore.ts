import { createContext } from "react";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (xdr: string) => Promise<string>;
}

export const WalletContext = createContext<WalletContextType | null>(null);
