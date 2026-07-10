# TradeMentor AI — Progress Log

## Current phase
Phase 1 — Scaffolding (baseline being committed)

## State for next session
Phase 1 scaffold (frontend + backend) now exists on disk and is committed as the baseline,
along with ARCHITECTURE.md; next loop should add CI (GitHub Actions) and a README skeleton,
then move into wiring the frontend to the backend.

## Acceptance checklist
### Production MVP
- [ ] Fully functional, production-ready MVP (no stubbed critical paths)
- [ ] Stable frontend + smart-contract architecture
- [ ] Mobile-responsive UI
- [ ] Proper loading states and error handling everywhere data is fetched or a tx is sent

### User Onboarding
- [ ] Minimum 10 real users onboarded
- [ ] Proof of wallet interactions captured (tx hashes / logs)
- [ ] Basic user feedback collection mechanism, mandatory and working

### Product Quality
- [ ] Deployed to production (not just localhost)
- [ ] Monitoring and analytics integrated
- [ ] Optimized UX (empty states, skeleton loaders, sane error copy)
- [ ] Proper project structure and documentation

### Technical Standards
- [ ] Smart contracts deployed on Stellar testnet, address recorded
- [ ] Minimum 15+ meaningful commits
- [ ] Public GitHub repository

### Demo & Review
- [ ] Live demo video covering full functionality
- [ ] Repo/README ready for review against: technical complexity, product quality,
      architecture quality, real-world usefulness

### Submission checklist (final artifacts)
- [ ] Public GitHub repo
- [ ] README with complete documentation
- [ ] 15+ meaningful commits
- [ ] Live demo link
- [ ] Contract deployment address
- [ ] Screenshots: product UI, mobile responsive view, analytics/monitoring setup
- [ ] Demo video link
- [ ] Proof of 10+ user wallet interactions
- [ ] Basic user feedback summary

## Task queue (next up, top = next)
- [ ] Add CI skeleton (GitHub Actions: frontend lint/typecheck/build + backend lint/import)
- [ ] Create README.md skeleton
- [ ] Wire frontend → backend (replace localStorage state with API client)
- [ ] Use AIService in `/ai` endpoints (replace hardcoded scores)
- [ ] Persist strategies/trades/challenges/reputation in backend (Phase 3)
- [ ] Create Soroban contracts (strategy versioning, challenge validation, reputation)
- [ ] Deploy contracts to Stellar testnet, record addresses in contracts/DEPLOYMENTS.md
- [ ] Add challenge-evaluation job → Soroban submission → real-time dashboard update
- [ ] Production deploy + monitoring/analytics + screenshots + demo video + 10 users

## Backlog (discovered but not yet scheduled)
- frontend/backend are disconnected (frontend is localStorage-only, zero HTTP calls)
- backend endpoints ai/trades/strategies/challenges/reputation return hardcoded mock data
- AIService (OpenRouter) is implemented but not imported by any endpoint
- no contracts/ dir; Soroban contract addresses are None in config
- verify-wallet has no nonce/timestamp → signature replayable; generate_auth_message unused
- no tests anywhere; alembic listed in requirements but no migrations/ or alembic.ini
- tradementor.db committed? (gitignored via *.db — confirm not tracked)
- demo wallet fallback in WalletContext should be gated to non-production

## Commit log (append, don't rewrite)
| Commit | Summary |
|---|---|
| current commit | chore(repo): initialize repository tracking |
| <this commit> | feat(scaffold): commit Phase 1 frontend+backend baseline and add ARCHITECTURE.md |
