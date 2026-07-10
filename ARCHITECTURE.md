# TradeMentor AI — Architecture

> Source of truth for structure and intentional deviations. Keep this in sync with
> `PROGRESS.md`. Updated every build loop.

## 1. Purpose

TradeMentor AI is a **decentralized trading-education platform** (the "Duolingo for trading
education"). It is an education/discipline tool, **not** a signals service and it never
guarantees profit. Two layers:

- **AI (coaching layer):** LLM + vision model review trades against the user's own
  strategy rules — technical, psychological, and risk-management feedback.
- **Soroban / Stellar (trust layer):** immutable strategy versioning, on-chain challenge
  validation, and a decentralized discipline-weighted reputation score.

## 2. Tech stack

| Layer      | Choice                                                            | Status            |
| ---------- | ----------------------------------------------------------------- | ----------------- |
| Frontend   | React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + react-router 7  | Scaffold present  |
| Wallet     | Freighter (browser extension), Ed25519 signature auth            | Frontend only     |
| Backend    | FastAPI + SQLAlchemy 2 (async) + Pydantic v2 + Uvicorn           | Scaffold present  |
| Auth       | JWT (HS256, access + refresh) + Stellar signature verification   | Implemented       |
| AI         | OpenRouter (one LLM + one vision model), `nvidia/nemotron-3-ultra`| `AIService` built |
| DB         | SQLite (dev, `aiosqlite`) / Postgres+asyncpg (prod)              | Configured        |
| Blockchain | Soroban smart contracts (Rust) on Stellar **testnet**            | Not started       |
| Tooling    | oxlint (frontend), alembic (listed, not yet initialized)         | Partial           |

## 3. Repository layout

```
.
├── ARCHITECTURE.md            # this file
├── PROGRESS.md                # loop state + acceptance checklist
├── backend/
│   ├── .env.example
│   ├── requirements.txt
│   ├── tradementor.db         # local SQLite (gitignored, regenerated on startup)
│   └── app/
│       ├── main.py            # FastAPI app, CORS, lifespan init_db
│       ├── core/              # config, security (JWT/bcrypt), exceptions, logging
│       ├── db/session.py      # async engine + DeclarativeBase
│       ├── models/user.py     # single ORM model: User
│       ├── schemas/           # user, auth (Pydantic v2)
│       ├── api/v1/endpoints/  # auth, users, strategies, trades, challenges,
│       │                     #   reputation, ai, health
│       ├── api/deps.py        # JWT bearer dependency
│       ├── services/ai_service.py  # real OpenRouter LLM + vision client
│       └── utils/wallet.py    # Stellar signature verify
└── frontend/
    ├── package.json, vite.config.ts, tsconfig*.json, .oxlintrc.json
    ├── index.html, dist/ (build output, gitignored)
    └── src/
        ├── main.tsx, App.tsx          # router + ProtectedRoute
        ├── contexts/WalletContext*    # Freighter wallet (+ demo fallback)
        ├── data/                      # localStorage state + calculations
        ├── components/layout/Layout.tsx
        └── pages/                     # Landing, Login, Dashboard, StrategyManager,
                                       #   TradeJournal, Challenges, Reputation, Settings
```

## 4. Current reality vs. intended design (deviations to resolve)

These gaps were found during the first loop and are tracked in `PROGRESS.md` backlog:

1. **Frontend and backend are not connected.** The frontend persists everything to
   `localStorage` (`tradementor.ai.workspace.v1`) and contains **zero** HTTP calls to the
   backend. The backend is effectively an unused standalone API. → Phase 3/5 wiring.
2. **Most backend endpoints return hardcoded/mock data.** `ai.py`, `trades.py`,
   `strategies.py`, `challenges.py`, `reputation.py` return static JSON/demo lists and do
   not touch the DB. Only `auth.py` and `users.py` use the database. → Phase 3.
3. **`AIService` is built but unused.** The real OpenRouter client in
   `services/ai_service.py` is never imported by the `ai` endpoints, which return canned
   `score: 84` responses. → Phase 4.
4. **No Soroban contracts exist yet.** `contracts/` directory is absent; contract
   addresses in `config.py` are `None`. → Phase 2.
5. **`verify-wallet` has no replay protection.** It verifies the Stellar signature but
   does not validate a nonce/timestamp, so a captured signature is replayable.
   `utils/wallet.py:generate_auth_message` builds a nonce but the endpoint does not use it.
   → Phase 3 hardening.
6. **No tests, no CI, no Alembic migrations** despite being listed in the spec/requirements.
   → Phase 1 (CI) and onward.

## 5. Data flow (intended, once wired)

```
Freighter ──signMessage──▶ /auth/verify-wallet ──▶ JWT
        │
Browser (React) ──POST /trades (+chart)──▶ FastAPI ──▶ AIService (LLM+vision)
                                                    │        │
                                                    ▼        ▼
                                              DB (trade)  feedback JSON
                                                    │
                                            Challenges job ──▶ Soroban contract
                                                              │
                                                              ▼
                                                  Reputation (on-chain) ──▶ Dashboard
```

## 6. Key design decisions

- **Wallet auth is passwordless** by design: users authenticate by signing a server
  challenge with Freighter. Users created via `verify-wallet` have no password; `login`
  treats password as optional. This is intentional but must be paired with nonce + rate
  limiting before production (see §4.5).
- **Frontend demo fallback:** when Freighter is absent, `WalletContext` falls back to a
  fake `GDEMO…` key and `demo-signature`. This keeps the UI usable without a wallet but
  must be clearly gated to non-production.
- **`DEBUG=true` and placeholder `JWT_SECRET_KEY`** ship in `.env.example`; never use these
  in production.

## 7. How to run (local)

Backend:
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env   # set JWT_SECRET_KEY (>=32 chars)
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## 8. Build phases (status)

- Phase 1 Scaffolding — **in progress** (scaffold on disk; CI + README + architecture doc pending commit)
- Phase 2 Soroban contracts — not started
- Phase 3 Backend core — partial (auth/users only)
- Phase 4 AI layer — partial (`AIService` built, not wired)
- Phase 5 Frontend features — partial (UI present, not wired to backend)
- Phase 6 Challenges & reputation wiring — not started
- Phase 7 Production readiness — not started
- Phase 8 Submission packaging — not started
