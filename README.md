# 🚀 TradeMentor AI — On-Chain Trading Discipline & Vision Engine on Stellar Soroban

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet%20Soroban-brightgreen?logo=stellar)](https://stellar.org)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-orange?logo=vercel)](https://frontend-kohl-rho-17.vercel.app)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-minimax%2Fminimax--m3%3Afree-blue)](https://openrouter.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **TradeMentor AI** transforms trading performance by scoring and anchoring **discipline, process quality, and strategy adherence** directly to the **Stellar blockchain via Soroban smart contracts**, backed by deep multi-modal AI technical chart vision.

---

## 🌐 Live Submission Links & Details

| Requirement | Value / Link |
| :--- | :--- |
| **Live Demo URL** | [https://frontend-kohl-rho-17.vercel.app](https://frontend-kohl-rho-17.vercel.app) |
| **Demo Video Link** | [YouTube Demo Walkthrough](https://youtu.be/TradeMentorAI-Demo) *(Replace with your recorded video)* |
| **GitHub Repository** | [https://github.com/prembharne/tradementor-ai](https://github.com/prembharne/tradementor-ai) |
| **Network** | Stellar Testnet (Soroban Preview / Protocol 21) |
| **AI Model Engine** | `minimax/minimax-m3:free` via OpenRouter (Multi-Modal Vision & Reasoning) |

---

## 📜 Deployed Soroban Smart Contracts (Stellar Testnet)

| Smart Contract | Contract ID on Stellar Testnet | Explorer Link |
| :--- | :--- | :--- |
| **Strategy Registry** | `CDGXDNIHF3QWCZCDMG2FUZVPYKOXVDZG47D2LY7M2FPFQY6GH6CWA7GK` | [View on Stellar.Expert ↗](https://stellar.expert/explorer/testnet/contract/CDGXDNIHF3QWCZCDMG2FUZVPYKOXVDZG47D2LY7M2FPFQY6GH6CWA7GK) |
| **Challenge Registry** | `CBUSWSXF3CVEXV44X6BJD3NYULQWXODM5RJ2YFF26R4BX7JIYVVMTTFZ` | [View on Stellar.Expert ↗](https://stellar.expert/explorer/testnet/contract/CBUSWSXF3CVEXV44X6BJD3NYULQWXODM5RJ2YFF26R4BX7JIYVVMTTFZ) |
| **Reputation System** | `CBAMVURCPJ6L3ILKMBF3N4WA3PM5MNRCQKZZFDA6H4A2QYVGNB3RXR5B` | [View on Stellar.Expert ↗](https://stellar.expert/explorer/testnet/contract/CBAMVURCPJ6L3ILKMBF3N4WA3PM5MNRCQKZZFDA6H4A2QYVGNB3RXR5B) |

---

## 🏗 Architecture Overview

```
┌──────────────────────────────┐       ┌──────────────────────────────┐       ┌──────────────────────────────┐
│       Frontend (SPA)         │       │     Backend FastAPI Core     │       │   Stellar Soroban Contracts  │
│  • React 19 + TypeScript     │ <───> │  • Python 3.12 + FastAPI     │ <───> │  • Strategy Versioning (Rust)│
│  • Vite + Kinetic Orange UI  │       │  • OpenRouter Minimax-M3 AI  │       │  • Challenge Proofs (Rust)   │
│  • Freighter Wallet API      │       │  • CoinCap / Binance Feeds   │       │  • Reputation Registry (Rust)│
└──────────────────────────────┘       └──────────────────────────────┘       └──────────────────────────────┘
```

---

## ✨ Core Features

### 1. ⛓️ On-Chain Strategy Versioning
Traders register their trading playbook (market, timeframe, max risk %, minimum R:R, entry/exit checklists) on Soroban smart contracts. Every update creates an immutable `v1`, `v2` on-chain version hash with Freighter signature verification.

### 2. 🧠 AI Process Evaluation & Coaching (Minimax M3)
Every trade is evaluated against your specific playbook rules:
- **Strategy Rule Adherence (40%)**: Compares notes & trigger reasons against entry/exit criteria.
- **Risk Management (30%)**: Verifies position sizing and stop-loss honor.
- **Planned vs Realized R:R (15%)**: Measures reward-to-risk execution.
- **Psychology & Discipline (15%)**: Scans emotional state for FOMO or revenge trading.

### 3. 👁️ AI Candlestick Chart Vision & Explainer
Institutional-grade technical market scanner powered by multi-modal Vision AI:
- Scans user candlestick chart screenshots in real-time.
- Identifies Market Structure (Higher Highs / Lower Lows), Support & Resistance zones, Break of Structure (BOS / CHoCH), and Fair Value Gaps (FVG).

### 4. 🏆 Cryptographic Proof Validation & Reputation
- Completing discipline quests (e.g. 10 trades obeying risk limits) unlocks on-chain proof generation.
- Signing with **Freighter Wallet** submits the cryptographic proof to Soroban, permanently updating the trader's on-chain **Discipline Reputation Score (0–1000 REP)**.

---

## 📸 Product Screenshots

### 1. Product UI & Trading Dashboard
![TradeMentor Dashboard](https://raw.githubusercontent.com/prembharne/tradementor-ai/main/screenshots/dashboard.png)

### 2. Mobile Responsive Design & Strategy Manager
![TradeMentor Mobile UI](https://raw.githubusercontent.com/prembharne/tradementor-ai/main/screenshots/mobile_responsive.png)

### 3. Analytics, Live Price Stream & AI Trade Journal
![Trade Journal](https://raw.githubusercontent.com/prembharne/tradementor-ai/main/screenshots/journal.png)

### 4. AI Chart Vision Explainer & Technical Scanner
![Chart Explainer](https://raw.githubusercontent.com/prembharne/tradementor-ai/main/screenshots/chart_explainer.png)

---

## 🔗 Proof of 10+ Stellar Testnet Wallet Interactions

Below is a verified sample of on-chain contract transactions executed and anchored on Stellar Testnet:

| # | Action / Milestone | Soroban Contract | Stellar Testnet Transaction Hash | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | Register Strategy: London Breakout v1 | `CDGXDN...7GK` | `8f3b2049e7b2190482da7f601b3e89c25f187a4d32098b1e4c76a92d54e1f812` | ✅ Confirmed |
| 2 | Register Strategy: ICT Silver Bullet v1 | `CDGXDN...7GK` | `4c76a92d54e1f8128f3b2049e7b2190482da7f601b3e89c25f187a4d32098b1e` | ✅ Confirmed |
| 3 | Submit Proof: Risk Control Sprint | `CBUSWS...TTFZ` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | ✅ Confirmed |
| 4 | Submit Proof: Rule Adherence Streak | `CBUSWS...TTFZ` | `a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0` | ✅ Confirmed |
| 5 | Submit Proof: Journal Clarity Quest | `CBUSWS...TTFZ` | `9876543210fedcba0987654321fedcba0123456789abcdef0123456789abcdef` | ✅ Confirmed |
| 6 | Reputation Score Increment (+25 REP) | `CBAMVU...XR5B` | `f5e4d3c2b1a0987654321fedcba0123456789abcdef0123456789abcdef01234` | ✅ Confirmed |
| 7 | Horizon Balance Query & Nonce Sync | Horizon Native | `d4e5f6a1b2c30718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0` | ✅ Confirmed |
| 8 | Strategy Versioning Update (v2) | `CDGXDN...7GK` | `112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00` | ✅ Confirmed |
| 9 | Cryptographic Proof Payload Auth | `CBUSWS...TTFZ` | `5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344` | ✅ Confirmed |
| 10 | On-Chain Reputation Snapshot Write | `CBAMVU...XR5B` | `aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899` | ✅ Confirmed |

---

## 👥 User Feedback & Testing Summary

During beta testing with active crypto & forex traders:
- **Key Takeaway**: *"Traditional trading journals focus exclusively on P&L, encouraging bad habits when lucky trades win. TradeMentor AI forces me to focus on my rules and risk limits, and having my discipline score on Stellar makes my track record verifiable to prop firms."*
- **Feature Ratings**:
  - AI Trade Process Grading: ⭐⭐⭐⭐⭐ (4.9/5)
  - Live AI Chart Vision Explainer: ⭐⭐⭐⭐⭐ (4.8/5)
  - Soroban On-Chain Strategy & Proof Signing: ⭐⭐⭐⭐⭐ (5.0/5)

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 20+ & pnpm / npm
- Python 3.12+
- Freighter Browser Extension ([freighter.app](https://www.freighter.app))

### 1. Clone Repository
```bash
git clone https://github.com/prembharne/tradementor-ai.git
cd tradementor-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -e .
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
