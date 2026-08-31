import { createContext } from "react";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<boolean>;
  connectDemo: () => void;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (xdr: string) => Promise<string>;
  loginWithBackend: (username?: string, password?: string) => Promise<void>;
  authLoading: boolean;
}

export const WalletContext = createContext<WalletContextType | null>(null);