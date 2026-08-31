"""Deterministic trade-review engine.

Produces a process-quality score and structured feedback by comparing a trade
against its strategy's rules. This runs with zero external dependencies so the
core product works offline; the AI layer (ai_service) can enrich the summary
when an API key is configured.
"""
from typing import Optional

from app.models.strategy import Strategy
from app.models.trade import Trade


def calculate_outcome_r(entry: float, exit: float, stop_loss: float, side: str) -> float:
    risk = abs(entry - stop_loss)
    if risk == 0:
        return 0.0
    pnl = exit - entry if side.lower() == "long" else entry - exit
    return round(pnl / risk, 2)


def calculate_reward_ratio(entry: float, take_profit: float, stop_loss: float) -> float:
    risk = abs(entry - stop_loss)
    if risk == 0:
        return 0.0
    reward = abs(take_profit - entry)
    return round(reward / risk, 2)


def build_review(trade: Trade, strategy: Optional[Strategy]) -> dict:
    risk_cap = strategy.risk_percent if strategy else 1.0
    rr_target = strategy.reward_ratio if strategy else 2.0
    timeframe = strategy.timeframe if strategy else "the traded"

    risk_ok = trade.risk_percent <= risk_cap
    reward_ratio = calculate_reward_ratio(trade.entry, trade.take_profit, trade.stop_loss)
    rr_ok = reward_ratio >= rr_target
    has_useful_notes = len((trade.notes or "").strip()) >= 60
    outcome_r = calculate_outcome_r(trade.entry, trade.exit, trade.stop_loss, trade.side)

    score = min(100, 42 + (24 if risk_ok else 0) + (18 if rr_ok else 0) + (16 if has_useful_notes else 4))

    followed = [
        f"Risk stayed within {risk_cap}%" if risk_ok else "Trade had a defined risk value",
        f"Planned reward ratio {reward_ratio}R met the {rr_target}R target"
        if rr_ok
        else "Reward target was documented",
        "Journal notes included decision context" if has_useful_notes else "Basic notes were captured",
    ]

    violated = [
        item
        for item in [
            f"Risk {trade.risk_percent}% exceeded the {risk_cap}% cap" if not risk_ok else "",
            f"Planned reward ratio {reward_ratio}R missed the {rr_target}R target" if not rr_ok else "",
            "Notes need more detail about setup, trigger, and emotion" if not has_useful_notes else "",
        ]
        if item
    ]

    if score >= 85:
        summary = "High-quality execution. The trade followed the strategy and protected process discipline."
    elif score >= 70:
        summary = "Useful trade with coachable process gaps. Tighten the pre-entry checklist before scaling."
    else:
        summary = "Process risk detected. Treat this as a review trade and reduce size until rules are followed."

    risk_feedback = (
        f"Risk was {trade.risk_percent}%, inside the strategy cap."
        if risk_ok
        else f"Risk was {trade.risk_percent}%, above the {risk_cap}% strategy cap."
    )

    psychology = (
        "Patient execution supports consistent decision quality."
        if trade.emotion == "Patient"
        else f"{trade.emotion} appeared in the journal. Name the feeling before entering next time."
    )

    next_step = (
        "Fix the violated rule before the next trade and keep size at baseline."
        if violated
        else "Repeat this playbook for three more trades before changing risk."
    )

    return {
        "score": score,
        "outcome_r": outcome_r,
        "summary": summary,
        "followed": followed,
        "violated": violated,
        "risk_feedback": risk_feedback,
        "psychology": psychology,
        "next_step": next_step,
        "chart_read": (
            f"The {trade.symbol} {timeframe} review should focus on structure confirmation, "
            "invalidation clarity, and whether entry respected the strategy trigger."
        ),
    }
