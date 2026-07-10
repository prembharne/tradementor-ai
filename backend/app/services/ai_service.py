from typing import Optional, Dict, Any
from uuid import UUID
import httpx
import json
import base64
from io import BytesIO

from app.core.config import settings


class AIService:
    """Service for AI-powered trading analysis using LLMs and vision models."""

    def __init__(self):
        self.base_url = settings.OPENROUTER_BASE_URL
        self.api_key = settings.OPENROUTER_API_KEY
        self.llm_model = settings.LLM_MODEL
        self.vision_model = settings.VISION_MODEL

    async def _call_llm(self, messages: list, model: str = None, max_tokens: int = 2000) -> str:
        """Call the LLM API."""
        if not self.api_key:
            return "AI service not configured. Please set OPENROUTER_API_KEY."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tradementor.ai",
            "X-Title": "TradeMentor AI",
        }

        payload = {
            "model": model or self.llm_model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _call_vision(self, image_base64: str, prompt: str, model: str = None) -> str:
        """Call the vision model API."""
        if not self.api_key:
            return "Vision service not configured. Please set OPENROUTER_API_KEY."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tradementor.ai",
            "X-Title": "TradeMentor AI",
        }

        payload = {
            "model": model or self.vision_model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"},
                        },
                    ],
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.5,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def analyze_trade(self, trade_id: UUID, chart_image: Optional[bytes] = None) -> Dict[str, Any]:
        """Analyze a trade against strategy rules and chart."""
        # TODO: Fetch trade and strategy from database
        trade = {
            "symbol": "BTCUSDT",
            "side": "long",
            "entry_price": 45000,
            "exit_price": 46000,
            "stop_loss": 44000,
            "take_profit": 47000,
            "quantity": 0.1,
        }

        strategy = {
            "name": "Trend Following",
            "risk_per_trade_pct": 2,
            "risk_reward_ratio": 3,
            "entry_rules": ["Price above 200 EMA", "RSI > 50", "MACD crossover"],
            "exit_rules": ["Take profit at 3R", "Stop loss at 1R", "Trailing stop after 1.5R"],
        }

        # Build analysis prompt
        prompt = self._build_trade_analysis_prompt(trade, strategy)

        # Add chart analysis if image provided
        chart_analysis = ""
        if chart_image:
            chart_analysis = await self._analyze_chart_image(chart_image, trade["symbol"])

        full_prompt = f"{prompt}\n\nChart Analysis:\n{chart_analysis}"

        analysis = await self._call_llm([
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": full_prompt},
        ])

        return {
            "trade_id": str(trade_id),
            "analysis": analysis,
            "chart_analysis": chart_analysis,
            "compliance_score": 85,  # TODO: Calculate from analysis
        }

    async def explain_chart(self, image: bytes, symbol: str, timeframe: str) -> Dict[str, Any]:
        """Analyze chart screenshot for market structure."""
        # Convert image to base64
        image_base64 = base64.b64encode(image).decode("utf-8")

        prompt = f"""Analyze this {symbol} {timeframe} chart screenshot. Identify and explain:

1. **Market Structure**: Higher highs/lows, lower highs/lows, trend direction
2. **Key Levels**: Support and resistance zones (with price levels if visible)
3. **Liquidity Zones**: Buy-side and sell-side liquidity areas
4. **Trend Analysis**: Current trend, strength, potential exhaustion signs
5. **BOS/CHoCH**: Break of Structure and Change of Character patterns
6. **Volume Profile**: Any visible volume clues
7. **Entry/Exit Suggestions**: High-probability zones based on structure

Format as structured JSON with clear sections."""

        analysis = await self._call_vision(image_base64, prompt)

        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "analysis": analysis,
        }

    async def coach_strategy(self, strategy_id: UUID, trade_data: Dict[str, Any]) -> Dict[str, Any]:
        """Compare trade against strategy rules and provide coaching feedback."""
        # TODO: Fetch strategy from database
        strategy = {
            "name": "Trend Following",
            "rules": {
                "entry": ["Price above 200 EMA", "RSI > 50", "MACD bullish crossover"],
                "exit": ["Take profit at 3R", "Stop loss at 1R"],
                "risk": ["Max 2% risk per trade", "Max 3 concurrent positions"],
            },
        }

        prompt = f"""You are a trading coach. Compare this trade against the strategy rules and provide detailed feedback.

Strategy: {strategy['name']}
Rules:
{json.dumps(strategy['rules'], indent=2)}

Trade:
{json.dumps(trade_data, indent=2)}

Analyze:
1. Which entry rules were followed/violated?
2. Which exit rules were followed/violated?
3. Risk management compliance
4. Psychological factors (FOMO, revenge trading, hesitation)
5. Specific actionable improvements
6. Score each category 0-100

Format as structured JSON."""

        analysis = await self._call_llm([
            {"role": "system", "content": self._get_coach_prompt()},
            {"role": "user", "content": prompt},
        ])

        return {
            "strategy_id": str(strategy_id),
            "coaching_feedback": analysis,
        }

    async def generate_weekly_report(self, user_id: UUID) -> Dict[str, Any]:
        """Generate weekly trading report with recurring mistake detection."""
        # TODO: Fetch user's trades from past week
        trades = []  # Placeholder

        prompt = f"""Generate a weekly trading report for user {user_id}.

Trades this week:
{json.dumps(trades, indent=2)}

Analyze:
1. Overall performance summary
2. Win rate, average R, expectancy
3. **Recurring mistakes** (pattern detection across trades)
4. Best trade of the week and why
5. Worst trade of the week and lesson
6. Strategy adherence rate
7. Risk management score
8. Psychology observations
9. Action items for next week

Format as structured JSON with clear sections."""

        report = await self._call_llm([
            {"role": "system", "content": self._get_report_prompt()},
            {"role": "user", "content": prompt},
        ])

        return {
            "user_id": str(user_id),
            "weekly_report": report,
        }

    def _get_system_prompt(self) -> str:
        return """You are TradeMentor AI, an expert trading coach and analyst.
Provide objective, educational analysis. Never guarantee profits or give financial advice.
Focus on discipline, risk management, and process over outcomes."""

    def _get_coach_prompt(self) -> str:
        return """You are a trading psychology coach and strategy compliance auditor.
Analyze trades against defined rules. Be constructive but honest about mistakes.
Identify psychological patterns (FOMO, revenge trading, hesitation, overconfidence).
Provide specific, actionable feedback."""

    def _get_report_prompt(self) -> str:
        return """You are a trading performance analyst.
Generate weekly reports that identify patterns, not just summarize P&L.
Focus on: recurring mistakes, strategy adherence, risk management, psychology.
Be concise but thorough. Use data-driven observations."""

    def _build_trade_analysis_prompt(self, trade: dict, strategy: dict) -> str:
        return f"""Analyze this trade:

Trade Details:
- Symbol: {trade['symbol']}
- Side: {trade['side']}
- Entry: {trade['entry_price']}
- Exit: {trade.get('exit_price', 'Open')}
- Stop Loss: {trade.get('stop_loss', 'None')}
- Take Profit: {trade.get('take_profit', 'None')}
- Quantity: {trade['quantity']}
- Risk/Reward: {self._calculate_rr(trade)}

Strategy Rules:
{json.dumps(strategy, indent=2)}

Provide analysis covering:
1. Strategy compliance (entry/exit/risk rules)
2. Risk management assessment
3. Trade execution quality
4. Psychological factors
5. Improvement suggestions"""

    def _calculate_rr(self, trade: dict) -> float:
        if not trade.get("stop_loss") or not trade.get("take_profit"):
            return 0
        risk = abs(trade["entry_price"] - trade["stop_loss"])
        reward = abs(trade["take_profit"] - trade["entry_price"])
        return round(reward / risk, 2) if risk > 0 else 0

    async def _analyze_chart_image(self, image: bytes, symbol: str) -> str:
        """Quick chart structure analysis."""
        image_base64 = base64.b64encode(image).decode("utf-8")
        prompt = f"Quickly identify market structure, key S/R levels, trend, and any BOS/CHoCH on this {symbol} chart. Be concise."
        return await self._call_vision(image_base64, prompt)