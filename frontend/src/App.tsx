import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useWallet } from "./contexts/useWallet";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { StrategyManager } from "./pages/StrategyManager";
import { TradeJournal } from "./pages/TradeJournal";
import { ChartExplainer } from "./pages/ChartExplainer";
import { Challenges } from "./pages/Challenges";
import { Reputation } from "./pages/Reputation";
import { Settings } from "./pages/Settings";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();
  return isConnected ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="strategies" element={<StrategyManager />} />
        <Route path="journal" element={<TradeJournal />} />
        <Route path="charts" element={<ChartExplainer />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="reputation" element={<Reputation />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
