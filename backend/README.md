# TradeMentor AI — Backend

## Requirements
- Python 3.11+
- FastAPI
- SQLAlchemy (async)
- Pydantic v2
- python-dotenv
- httpx (for external API calls)
- python-jose (JWT)
- passlib (password hashing)
- stellar-sdk (for Soroban contract interactions)
- freighter-sdk (for wallet verification)

## Installation
```bash
pip install -r requirements.txt
```

## Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables
Copy `.env.example` to `.env` and fill in values.