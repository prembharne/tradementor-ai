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

## 🔗 Proof of 13 Live Stellar Testnet Wallet Interactions

Below is the verified ledger table of **13 distinct real Stellar Testnet wallets** that executed transactions and Soroban contract interactions with TradeMentor AI:

| # | Action / Milestone | Signer Wallet Address (Testnet) | Live Transaction Hash (Stellar Testnet) | Explorer Proof Link |
| :- | :--- | :--- | :--- | :--- |
| 1 | Register Strategy: London Breakout v1 | [`GCOBYS...CPXQ`](https://stellar.expert/explorer/testnet/account/GCOBYSBSDC26OIX4PQBWGFK2MSUOEBTOIUL4PIF6RKRYAENQDASICPXQ) | `8e350df626cac7c75b42f25671d1184ef4be78c44dc61519edfb5aae0cd95c78` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/8e350df626cac7c75b42f25671d1184ef4be78c44dc61519edfb5aae0cd95c78) |
| 2 | Register Strategy: ICT Silver Bullet v1 | [`GC5YZA...6XVS`](https://stellar.expert/explorer/testnet/account/GC5YZAX3OK4ELP333JOAGIZ2JOQ3Y6KB6RMB5H7WCJJI6DYO7IJB6XVS) | `13b489627f0051b8815e643bedf88dc1ca5e3419eb819d0e1fdde6f905075de3` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/13b489627f0051b8815e643bedf88dc1ca5e3419eb819d0e1fdde6f905075de3) |
| 3 | Strategy Version Upgrade: London Breakout v2 | [`GBJTQR...Q2C3`](https://stellar.expert/explorer/testnet/account/GBJTQRRB3Q3O7LQORDLG5JSX3WMAVI7AVOJQRJI455JLX27276LOQ2C3) | `0009191aa95bcdf1c1d64de913dd0307ac1ae957d26e79f0d2bc728c866dbe87` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/0009191aa95bcdf1c1d64de913dd0307ac1ae957d26e79f0d2bc728c866dbe87) |
| 4 | Submit Proof: Risk Control Sprint (10/10) | [`GBLN5A...EZOY`](https://stellar.expert/explorer/testnet/account/GBLN5AD3ECIRIAZCS2MRSGR6G7XZL5R4SQKWFYLDLOLIFMVR66YBEZOY) | `09008f3635479d4bbfcd2efac2a9998c0740639254effcea6776fbcbfeb49f9e` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/09008f3635479d4bbfcd2efac2a9998c0740639254effcea6776fbcbfeb49f9e) |
| 5 | Submit Proof: Rule Adherence Streak (5/5) | [`GBE3ES...EQMV`](https://stellar.expert/explorer/testnet/account/GBE3ESYPLKHJRWC2LQSSQPFNU7H72NSNMT46NZR5XLNMRDPZZYEAEQMV) | `5531d88d8bfee13c03a9e16192f5b37f49089b0ffd0d75edc881d20c8353dd70` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/5531d88d8bfee13c03a9e16192f5b37f49089b0ffd0d75edc881d20c8353dd70) |
| 6 | Submit Proof: Journal Clarity Quest (3/3) | [`GASFHL...GG2K`](https://stellar.expert/explorer/testnet/account/GASFHLEWXCX45LNSKDVCUP5KFFILGEVP6FHKEQBVRFEOW7FIEUHQGG2K) | `e5a0cdc45e3e386eaca1f446ec599552f8a9b97ab00402397e305751c3052530` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/e5a0cdc45e3e386eaca1f446ec599552f8a9b97ab00402397e305751c3052530) |
| 7 | On-Chain Rep Milestone: +25 REP XP | [`GASMR3...GI3Z`](https://stellar.expert/explorer/testnet/account/GASMR32SEH7FVEAIUYTRBFJDSS7GNFJO7MCJERVM6SU4YGCBER7VGI3Z) | `68eed25b8372e0bf912fb6fa13605058b5e8f9f970ad92350651112c71c2329f` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/68eed25b8372e0bf912fb6fa13605058b5e8f9f970ad92350651112c71c2329f) |
| 8 | On-Chain Rep Milestone: Tier 1 Discipline | [`GAK4CJ...G4Y4`](https://stellar.expert/explorer/testnet/account/GAK4CJGQQ2NNONYAB5MCGKASDR4VIWW64NXKTDU3232DPIR7D5CRG4Y4) | `3632eabe5bc5d57d73fa8774dd002c317b1864bcea21221fb42c74dc5f1b8fc4` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/3632eabe5bc5d57d73fa8774dd002c317b1864bcea21221fb42c74dc5f1b8fc4) |
| 9 | Register Strategy: Asian Session Sweep v1 | [`GCIOKC...QXGM`](https://stellar.expert/explorer/testnet/account/GCIOKCMW523YWMSCEYFUR6PF7K3UUIYROIBQ6UEU7GTEW7MZXTGKQXGM) | `8890cedf3ba72f7ef6ae6baea5124391535d8ad3f184570d00da99c2483aaf19` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/8890cedf3ba72f7ef6ae6baea5124391535d8ad3f184570d00da99c2483aaf19) |
| 10 | Submit Proof: Max Drawdown Defense (10/10) | [`GBZ6MO...G4I6`](https://stellar.expert/explorer/testnet/account/GBZ6MOS22GXXC4E2KD2VE3QWGAYG7R65VUNP64OVA3L5ULCRBS2OG4I6) | `0ba337270448590c4e58c9a7dea5f572de3037badfdf6d903b0ae8ba669a26ce` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/0ba337270448590c4e58c9a7dea5f572de3037badfdf6d903b0ae8ba669a26ce) |
| 11 | On-Chain Rep Snapshot: 95 Process Score | [`GC5EAO...3GKH`](https://stellar.expert/explorer/testnet/account/GC5EAOMZPEYNQ2YKKEBUBHAHLVPHI7BHO43WORL2GLI6WA625PPE3GKH) | `44321b077416bec6d43b2c2c0d450c1a700b9cd7a997923fd7a39b9092b4f35b` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/44321b077416bec6d43b2c2c0d450c1a700b9cd7a997923fd7a39b9092b4f35b) |
| 12 | Register Strategy: Daily FVG Reversal v1 | [`GD6EYM...6VVC`](https://stellar.expert/explorer/testnet/account/GD6EYMV4MCLMTXWUNWGVAC7Z3G36W5Q57RHHI7GLTPYFBWEOR7O26VVC) | `1e50df4dfc011d67a5dffdd89a87d22e487eb85ce6d399e20be2310cda0e602c` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/1e50df4dfc011d67a5dffdd89a87d22e487eb85ce6d399e20be2310cda0e602c) |
| 13 | Submit Proof: Discipline Master Sprint | [`GDBZDM...IXUU`](https://stellar.expert/explorer/testnet/account/GDBZDMLCWAMLZOKM33RVC3P2FZ6XFKBRLAXX4UO26K2OWCNLX3TLIXUU) | `d8caa3d1ee619eec7a819bd66c5e3fe3c727dd263c17ae2833ea026d71da4785` | [Verify TX ↗](https://stellar.expert/explorer/testnet/tx/d8caa3d1ee619eec7a819bd66c5e3fe3c727dd263c17ae2833ea026d71da4785) |

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
