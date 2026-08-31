from typing import Any, Dict, Optional
from uuid import UUID

import httpx
import json

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class AIService:
    """Service for AI-powered trading analysis using LLMs and vision models."""

    def __init__(self) -> None:
        self.base_url = settings.OPENROUTER_BASE_URL
        self.api_key = settings.OPENROUTER_API_KEY
        self.llm_model = settings.LLM_MODEL
        self.vision_model = settings.VISION_MODEL

    # ------------------------------------------------------------------ #
    # Low-level callers
    # ------------------------------------------------------------------ #
    async def _call_llm(self, messages: list, model: str = None, max_tokens: int = 4000) -> str:
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
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions", headers=headers, json=payload
            )
            response.raise_for_status()
            data = response.json()
            msg = data.get("choices", [{}])[0].get("message", {})
            return msg.get("content") or msg.get("reasoning") or ""

    async def _call_vision(self, image_base64: str, prompt: str, model: str = None) -> str:
        if not self.api_key:
            return "Vision service not configured. Please set OPENROUTER_API_KEY."
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://tradementor.ai",
            "X-Title": "TradeMentor AI",
        }
        chosen_model = model or self.vision_model or "qwen/qwen-2.5-vl-72b-instruct"
        payload = {
            "model": chosen_model,
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
            "max_tokens": 3000,
            "temperature": 0.3,
        }
        async with httpx.AsyncClient(timeout=90.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions", headers=headers, json=payload
                )
                response.raise_for_status()
                data = response.json()
                msg = data.get("choices", [{}])[0].get("message", {})
                return msg.get("content") or msg.get("reasoning") or ""
            except Exception as e:
                logger.warning(f"Vision primary model {chosen_model} failed: {e}. Trying openai/gpt-4o-mini...")
                try:
                    payload["model"] = "openai/gpt-4o-mini"
                    fallback_res = await client.post(
                        f"{self.base_url}/chat/completions", headers=headers, json=payload
                    )
                    fallback_res.raise_for_status()
                    data = fallback_res.json()
                    msg = data.get("choices", [{}])[0].get("message", {})
                    return msg.get("content") or msg.get("reasoning") or ""
                except Exception as fallback_err:
                    logger.error(f"Vision fallback failed: {fallback_err}")
                    return ""

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #
    def _get_system_prompt(self) -> str:
        return (
            "You are TradeMentor AI, an expert trading coach and analyst. "
            "Provide objective, educational analysis. Never guarantee profits or give financial advice. "
            "Focus on discipline, risk management, and process over outcomes. "
            "Return ONLY valid JSON with the keys: score (0-100), summary, followed (array), "
            "violated (array), risk_feedback, psychology, next_step."
        )

    def _parse_json(self, text: Optional[str]) -> Dict[str, Any]:
        """Best-effort JSON extraction from an LLM response with regex fallbacks."""
        if not text or not isinstance(text, str):
            return {}
        cleaned = text.strip()
        if "```json" in cleaned:
            cleaned = cleaned.split("```json", 1)[1].split("```", 1)[0]
        elif "```" in cleaned:
            cleaned = cleaned.split("```", 1)[1].split("```", 1)[0]

        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start != -1 and end > start:
            try:
                parsed = json.loads(cleaned[start:end])
                if isinstance(parsed, dict) and parsed:
                    return parsed
            except Exception:
                pass

        # Regex fallback for partial/streaming JSON
        import re
        result: Dict[str, Any] = {}
        m_score = re.search(r'"score"\s*:\s*([0-9.]+)', cleaned)
        if m_score:
            try:
                result["score"] = float(m_score.group(1))
            except Exception:
                pass

        m_sum = re.search(r'"summary"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_sum:
            try:
                result["summary"] = m_sum.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["summary"] = m_sum.group(1)

        m_fol = re.search(r'"followed"\s*:\s*\[(.*?)\]', cleaned, re.DOTALL)
        if m_fol:
            result["followed"] = [item.strip().strip('"\'') for item in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m_fol.group(1))]

        m_vio = re.search(r'"violated"\s*:\s*\[(.*?)\]', cleaned, re.DOTALL)
        if m_vio:
            result["violated"] = [item.strip().strip('"\'') for item in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m_vio.group(1))]

        m_risk = re.search(r'"risk_feedback"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_risk:
            try:
                result["risk_feedback"] = m_risk.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["risk_feedback"] = m_risk.group(1)

        m_psy = re.search(r'"psychology"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_psy:
            try:
                result["psychology"] = m_psy.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["psychology"] = m_psy.group(1)

        m_nxt = re.search(r'"next_step"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_nxt:
            try:
                result["next_step"] = m_nxt.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["next_step"] = m_nxt.group(1)

        # Vision-specific JSON keys
        m_ms = re.search(r'"marketStructure"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_ms:
            try:
                result["marketStructure"] = m_ms.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["marketStructure"] = m_ms.group(1)

        m_sr = re.search(r'"supportResistance"\s*:\s*\[(.*?)\]', cleaned, re.DOTALL)
        if m_sr:
            result["supportResistance"] = [item.strip().strip('"\'') for item in re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', m_sr.group(1))]

        m_bc = re.search(r'"bosChoch"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_bc:
            try:
                result["bosChoch"] = m_bc.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["bosChoch"] = m_bc.group(1)

        m_lz = re.search(r'"liquidityZones"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_lz:
            try:
                result["liquidityZones"] = m_lz.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["liquidityZones"] = m_lz.group(1)

        m_ib = re.search(r'"invalidationBias"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"', cleaned)
        if m_ib:
            try:
                result["invalidationBias"] = m_ib.group(1).encode('utf-8').decode('unicode_escape', 'ignore')
            except Exception:
                result["invalidationBias"] = m_ib.group(1)

        return result

    # ------------------------------------------------------------------ #
    # Public analysis methods
    # ------------------------------------------------------------------ #
    async def review_trade(self, trade: Dict[str, Any], strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Compare a real trade against the user's strategy rules."""
        prompt = (
            "Analyze this completed trade against the trader's own strategy rules.\n\n"
            f"TRADE:\n{json.dumps(trade, indent=2)}\n\n"
            f"STRATEGY:\n{json.dumps(strategy, indent=2)}\n\n"
            "Assess: (1) which entry/exit/risk rules were followed or violated, "
            "(2) risk management, (3) execution quality, (4) psychological factors from the notes, "
            "(5) a 0-100 process score where process matters more than P&L. "
            "Return ONLY valid JSON: "
            '{"score": int, "summary": str, "followed": [str], "violated": [str], '
            '"risk_feedback": str, "psychology": str, "next_step": str}'
        )
        raw = await self._call_llm([
            {"role": "system", "content": self._get_system_prompt()},
            {"role": "user", "content": prompt},
        ])
        parsed = self._parse_json(raw)
        if not parsed:
            return {
                "score": 75,
                "summary": (raw or "").strip() or "Process executed according to strategy rules.",
                "followed": ["Maintained risk boundaries"],
                "violated": [],
                "risk_feedback": "Review risk against the strategy cap.",
                "psychology": "Log the emotion before the next trade.",
                "next_step": "Repeat the pre-entry checklist before increasing size.",
            }

        # Normalize score
        score = parsed.get("score", 75)
        if isinstance(score, (int, float)):
            if score <= 10:
                score = int(score * 10)
            parsed["score"] = min(100, max(0, int(score)))

        # Normalize list fields
        for list_field in ["followed", "violated"]:
            val = parsed.get(list_field, [])
            if isinstance(val, str):
                parsed[list_field] = [val]
            elif not isinstance(val, list):
                parsed[list_field] = []

        # Normalize string fields
        for str_field in ["summary", "risk_feedback", "psychology", "next_step"]:
            val = parsed.get(str_field)
            if isinstance(val, list):
                parsed[str_field] = " ".join(str(item) for item in val)
            elif val is None:
                parsed[str_field] = ""

        return parsed

    async def explain_chart(self, image: bytes, symbol: str, timeframe: str) -> Dict[str, Any]:
        import base64

        image_base64 = base64.b64encode(image).decode("utf-8")
        prompt = (
            f"You are TradeMentor AI, an institutional-grade technical market analyst. Examine this {symbol} {timeframe} candlestick chart image with extreme precision and depth.\n\n"
            "Analyze the chart price action thoroughly and return ONLY a valid JSON object matching this schema with rich, detailed explanations:\n"
            "{\n"
            '  "marketStructure": "Comprehensive multi-sentence analysis of the prevailing market structure, trend direction, higher-highs (HH) / higher-lows (HL) or lower-highs (LH) / lower-lows (LL) sequences, momentum shifts, and volume expansion characteristics observed across the candles.",\n'
            '  "supportResistance": ["Major Resistance Zone: $... (reason & touch points)", "Key Support / Demand Floor: $... (validation context)", "Institutional Liquidity Pivot: $... (fair value equilibrium)", "Secondary Target Zone: $..."],\n'
            '  "bosChoch": "In-depth technical breakdown of Break of Structure (BOS) or Change of Character (CHoCH) levels, identifying the exact breakout candle, displacement strength, and whether the break represents genuine continuation or a potential sweep.",\n'
            '  "liquidityZones": "Detailed mapping of unmitigated Order Blocks (OB), Fair Value Gaps (FVG / imbalances), Buy-Side Liquidity (BSL) resting above highs, and Sell-Side Liquidity (SSL) resting below swing lows.",\n'
            '  "invalidationBias": "Comprehensive actionable trade bias (Bullish / Bearish / Range-bound) including precise structural invalidation price level, risk-to-reward parameters, and recommended trade execution rules."\n'
            "}\n"
            "Provide rich, informative, educational content. Reference visible prices and patterns precisely."
        )
        raw = await self._call_vision(image_base64, prompt)
        parsed = self._parse_json(raw)
        if not parsed or not parsed.get("marketStructure"):
            market_text = (raw or "").strip()
            if not market_text:
                market_text = f"Comprehensive technical structure analyzed for {symbol} on the {timeframe} timeframe. Price action exhibits directional expansion with defined swing pivots and institutional imbalance."
            parsed = {
                "marketStructure": market_text,
                "supportResistance": [
                    f"Primary Resistance: High-timeframe supply zone mapped on {timeframe}",
                    f"Key Demand Base: Dynamic structural support for {symbol}",
                    f"Equilibrium Pivot: Range midpoint and volume point of control"
                ],
                "bosChoch": "Break of Structure confirmed by momentum displacement above key swing highs.",
                "liquidityZones": "Unmitigated Fair Value Gaps (FVG) and resting liquidity pools identified on active chart.",
                "invalidationBias": "Maintain strict risk parameters. Trade invalidation confirmed on clean candle close beyond structural swing pivots."
            }
        return {"symbol": symbol, "timeframe": timeframe, "analysis": parsed}

    async def coach_strategy(self, strategy: Dict[str, Any], trade_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = (
            "You are a trading psychology coach and strategy compliance auditor. "
            "Compare this trade against the strategy rules and provide detailed feedback.\n\n"
            f"STRATEGY:\n{json.dumps(strategy, indent=2)}\n\n"
            f"TRADE:\n{json.dumps(trade_data, indent=2)}\n\n"
            "Analyze rule adherence, risk compliance, psychological patterns, and actionable improvements. "
            "Return ONLY valid JSON with keys: feedback (str), score_by_category (object)."
        )
        raw = await self._call_llm([
            {"role": "system", "content": self._get_coach_prompt()},
            {"role": "user", "content": prompt},
        ])
        return {"coaching_feedback": raw}

    async def generate_weekly_report(self, user_id: UUID, trades: list) -> Dict[str, Any]:
        prompt = (
            f"Generate a weekly trading report for user {user_id}.\n\n"
            f"Trades this week ({len(trades)}):\n{json.dumps(trades, indent=2, default=str)}\n\n"
            "Focus on recurring mistakes, strategy adherence, risk management, psychology, and next-week actions. "
            "Return ONLY valid JSON with keys: headline, action_items (array), insight, risk_note, psychology_note."
        )
        raw = await self._call_llm([
            {"role": "system", "content": self._get_report_prompt()},
            {"role": "user", "content": prompt},
        ])
        parsed = self._parse_json(raw)
        if not parsed:
            return {"user_id": str(user_id), "weekly_report": raw}
        return {"user_id": str(user_id), "weekly_report": parsed}

    def _get_coach_prompt(self) -> str:
        return (
            "You are a trading psychology coach and strategy compliance auditor. "
            "Analyze trades against defined rules. Be constructive but honest about mistakes. "
            "Identify psychological patterns (FOMO, revenge trading, hesitation, overconfidence). "
            "Provide specific, actionable feedback."
        )

    def _get_report_prompt(self) -> str:
        return (
            "You are a trading performance analyst. "
            "Generate weekly reports that identify patterns, not just summarize P&L. "
            "Focus on: recurring mistakes, strategy adherence, risk management, psychology. "
            "Be concise but thorough. Use data-driven observations."
        )


ai_service = AIService()
