# TradeMentor AI

AI-powered trading mentor with on-chain reputation on Stellar Soroban.

## 🏗 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   Backend       │     │   Blockchain    │
│   (React 19)    │◄───►│   (FastAPI)     │◄───►│   (Soroban)     │
│   Vite + TS     │     │   SQLAlchemy 2  │     │   Rust Contracts│
│   Tailwind 4    │     │   SQLite/Postgres│    │   Stellar Testnet│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Components

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind 4 | SPA with wallet integration (Freighter) |
| **Backend** | FastAPI, SQLAlchemy 2.0 async, Pydantic v2 | REST API with JWT auth, AI trade reviews |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Users, Strategies, Trades, Challenges, Reputation |
| **Blockchain** | Soroban (Rust), Stellar Testnet | Strategy versioning, Challenge validation, Reputation |
| **AI** | OpenRouter (Nemotron 3 Ultra) | Deterministic fallback when no API key |

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+
- pnpm
- Docker (optional, for Postgres)

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
cp .env.example .env  # Edit with your values
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
pnpm install
pnpm run dev
```

### 3. Smart Contracts (optional, for on-chain features)
```bash
# Install soroban CLI
cargo install --locked soroban-cli

# Build
cargo build --release --target wasm32-unknown-unknown

# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tradementor_strategy.wasm \
  --network testnet \
  --source deployer
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register with wallet
- `POST /api/v1/auth/login` - Login (wallet-based)
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Current user

### Strategies
- `POST /api/v1/strategies/` - Create strategy
- `GET /api/v1/strategies/` - List user strategies
- `GET /api/v1/strategies/{id}` - Get strategy
- `PUT /api/v1/strategies/{id}` - Update strategy
- `POST /api/v1/strategies/{id}/version` - Create new version
- `POST /api/v1/strategies/{id}/publish` - Publish to chain

### Trades
- `POST /api/v1/trades/` - Log trade (triggers AI review)
- `GET /api/v1/trades/` - List trades
- `GET /api/v1/trades/{id}` - Get trade with review

### Challenges
- `GET /api/v1/challenges/` - List all challenges
- `GET /api/v1/challenges/joined` - User's joined challenges
- `POST /api/v1/challenges/{id}/join` - Join challenge
- `POST /api/v1/challenges/evaluate` - Re-evaluate progress

### Reputation
- `GET /api/v1/reputation/` - User reputation snapshot
- `GET /api/v1/reputation/leaderboard` - Global leaderboard
- `GET /api/v1/reputation/history` - Reputation events

### AI
- `POST /api/v1/ai/review-trade` - Get AI review
- `POST /api/v1/ai/analyze-chart` - Analyze chart image
- `POST /api/v1/ai/coach` - Strategy coaching

## 🐳 Production Deployment

### 1. Prepare Environment
```bash
cp .env.production.template .env
# Edit .env with production values
```

### 2. SSL Certificates
```bash
# Using Let's Encrypt
certbot certonly --standalone -d tradementor.ai -d www.tradementor.ai -d api.tradementor.ai
# Copy to nginx/ssl/
```

### 3. Deploy with Docker Compose
```bash
docker compose up -d
```

### 4. Verify
```bash
curl https://tradementor.ai/health
curl https://api.tradementor.ai/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | sqlite | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Yes | - | 32+ char secret for JWT |
| `STELLAR_NETWORK` | No | testnet | testnet/mainnet |
| `STRATEGY_CONTRACT_ADDRESS` | No | - | Deployed contract address |
| `CHALLENGE_CONTRACT_ADDRESS` | No | - | Deployed contract address |
| `REPUTATION_CONTRACT_ADDRESS` | No | - | Deployed contract address |
| `OPENROUTER_API_KEY` | No | - | For AI reviews |
| `FRONTEND_URL` | Yes | - | CORS origin |

### Smart Contract Deployment

```bash
# 1. Build contracts
cargo build --release --target wasm32-unknown-unknown

# 2. Deploy each contract
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/tradementor_strategy.wasm \
  --network testnet \
  --source deployer

# 3. Initialize contracts (run once)
soroban contract invoke \
  --id <STRATEGY_CONTRACT_ID> \
  --network testnet \
  --source deployer \
  -- initialize --admin <ADMIN_ADDRESS>

# 4. Update .env with contract addresses
```

## 🧪 Testing

```bash
# Backend smoke test
cd backend
.venv/bin/python smoke_test.py

# Frontend build test
cd frontend
pnpm run build

# Contract tests
cargo test --workspace
```

## 📊 Monitoring

- **Health Checks**: `/health` on all services
- **Metrics**: Prometheus + Grafana (add to docker-compose)
- **Logging**: Structured JSON logs via structlog
- **Error Tracking**: Sentry (configure `SENTRY_DSN`)

## 🔐 Security

- JWT tokens with short expiry (30min) + refresh tokens
- bcrypt password hashing (for email auth)
- Rate limiting on auth endpoints
- Security headers via nginx
- CORS restricted to `FRONTEND_URL`
- Non-root Docker containers
- Input validation via Pydantic

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Run tests: `pnpm run test` (frontend) / `pytest` (backend)
4. Submit PR

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- Issues: GitHub Issues
- Discord: [TradeMentor Community]
- Email: support@tradementor.ai
