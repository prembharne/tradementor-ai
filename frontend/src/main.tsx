import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { WalletProvider } from "./contexts/WalletContext";
import { TradeMentorProvider } from "./data/TradeMentorProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <WalletProvider>
        <TradeMentorProvider>
          <App />
        </TradeMentorProvider>
      </WalletProvider>
    </BrowserRouter>
  </StrictMode>,
);
