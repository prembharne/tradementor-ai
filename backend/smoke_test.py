"""End-to-end smoke test for the real (DB-backed) API.

Run with: .venv/Scripts/python smoke_test.py
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./tradementor_test.db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-at-least-32-chars-long")

import asyncio
import os

# start from a clean DB each run
_test_db = "./tradementor_test.db"
if os.path.exists(_test_db):
    os.remove(_test_db)

from fastapi.testclient import TestClient

import app.main  # noqa: F401
from app.db.session import init_db, close_db

asyncio.run(init_db())
client = TestClient(app.main.app, raise_server_exceptions=True)

WALLET = "G" + "A" * 55  # fake 56-char Stellar-style pubkey for the test

# 1. register (wallet-based, no password)
r = client.post("/api/v1/auth/register", json={"wallet_address": WALLET, "username": "smoke", "email": "smoke@example.com"})
assert r.status_code == 201, r.text
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("register:", r.status_code)

# 2. create strategy
r = client.post(
    "/api/v1/strategies",
    headers=headers,
    json={
        "name": "London Breakout",
        "market": "BTCUSDT",
        "timeframe": "15m",
        "risk_percent": 1.0,
        "reward_ratio": 2.2,
        "entry_rules": ["Close above session high", "Confirm displacement"],
        "exit_rules": ["TP at 2R", "Trail after 1R"],
        "status": "published",
    },
)
assert r.status_code == 201, r.text
strategy = r.json()
print("create strategy:", r.status_code, strategy["id"])
strategy_id = strategy["id"]

# 3. list strategies
r = client.get("/api/v1/strategies", headers=headers)
assert r.status_code == 200 and len(r.json()) == 1, r.text
print("list strategies:", r.status_code, "count=", len(r.json()))

# 4. create trade (triggers AI review; AI may be unconfigured -> graceful fallback)
r = client.post(
    "/api/v1/trades",
    headers=headers,
    json={
        "strategy_id": strategy_id,
        "symbol": "BTCUSDT",
        "side": "Long",
        "entry": 63780,
        "exit": 65240,
        "stop_loss": 63220,
        "take_profit": 65180,
        "risk_percent": 0.9,
        "emotion": "Patient",
        "notes": "Waited for the first 15m candle close, took the retest after displacement. Clean process.",
    },
)
assert r.status_code == 201, r.text
trade = r.json()
print("create trade:", r.status_code, "review_score=", trade.get("review", {}).get("score"))

# 5. list trades
r = client.get("/api/v1/trades", headers=headers)
assert r.status_code == 200, r.text
print("list trades:", r.status_code, "count=", len(r.json()))

# 6. challenges evaluated from trades
r = client.get("/api/v1/challenges/", headers=headers)
assert r.status_code == 200, r.text
print("challenges (before join):", r.status_code, "items=", len(r.json()["items"]))

# Join the risk-control challenge
risk_challenge = next(c for c in r.json()["items"] if c["code"] == "risk-control")
r = client.post(f"/api/v1/challenges/{risk_challenge['id']}/join", headers=headers)
assert r.status_code == 200, r.text
print("join risk-control:", r.status_code)

# Evaluate challenges
r = client.post("/api/v1/challenges/evaluate", headers=headers)
assert r.status_code == 200, r.text
print("evaluate challenges:", r.status_code)
for c in r.json()["items"]:
    print(f"  {c['code']} progress: {c['progress']}/{c['target']}")

# 7. reputation computed
r = client.get("/api/v1/reputation/", headers=headers)
assert r.status_code == 200, r.text
print("reputation:", r.status_code, r.json())

# 8. leaderboard
r = client.get("/api/v1/reputation/leaderboard", headers=headers)
assert r.status_code == 200, r.text
print("leaderboard:", r.status_code)

print("\nALL SMOKE TESTS PASSED")
close_db()
