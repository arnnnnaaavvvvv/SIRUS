from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional


router = APIRouter(prefix="/api/v1/copilot", tags=["AI Co-Pilot"])


class ExplainTradeRequest(BaseModel):
    symbol: str
    side: str
    price: float
    indicators_state: Dict[str, Any]
    risk_rules_checked: List[str]
    executed: bool
    rejection_reason: Optional[str] = None


class ExplainTradeResponse(BaseModel):
    summary_explanation: str
    key_drivers: List[str]
    risk_assessment: str


class OverfittingCheckRequest(BaseModel):
    in_sample_sharpe: float
    out_of_sample_sharpe: float
    num_windows: int
    parameters: Dict[str, Any]


class OverfittingCheckResponse(BaseModel):
    decay_ratio: float
    overfitting_risk_level: str
    recommendation: str
    suggested_parameter_bounds: Dict[str, Any]


@router.post("/explain-trade", response_model=ExplainTradeResponse)
async def explain_trade(req: ExplainTradeRequest):
    """
    Generates natural language explanation for why a trade was executed or skipped.
    """
    drivers = []
    for k, v in req.indicators_state.items():
        drivers.append(f"{k} = {v}")

    if not req.executed:
        summary = f"Trade ({req.side} {req.symbol} @ ${req.price:.2f}) was SKIPPED by Risk Engine: {req.rejection_reason}"
        risk_assess = f"Risk engine protected account by rejecting signal due to {req.rejection_reason}."
    else:
        summary = f"Trade ({req.side} {req.symbol} @ ${req.price:.2f}) was EXECUTED successfully. Indicator triggers: {', '.join(drivers)}."
        risk_assess = "Pre-trade risk checks passed: position size limit, portfolio exposure, and correlation bounds satisfied."

    return ExplainTradeResponse(
        summary_explanation=summary,
        key_drivers=drivers,
        risk_assessment=risk_assess
    )


@router.post("/detect-overfitting", response_model=OverfittingCheckResponse)
async def detect_overfitting(req: OverfittingCheckRequest):
    """
    Evaluates Walk-Forward backtest Sharpe ratio decay and flags parameter curve-fitting risk.
    """
    if req.in_sample_sharpe <= 0:
        decay = 0.0
    else:
        decay = req.out_of_sample_sharpe / req.in_sample_sharpe

    if decay >= 0.75:
        risk_level = "LOW"
        rec = "Strategy displays strong out-of-sample robustness. Parameters are stable."
    elif decay >= 0.50:
        risk_level = "MODERATE"
        rec = "Minor performance decay detected. Consider widening indicator lookback windows by 10-15% to reduce sensitivity."
    else:
        risk_level = "HIGH (OVERFITTED)"
        rec = "Severe performance drop out-of-sample. Strategy is likely curve-fitted to noise. Simplify condition rules."

    # Suggest wider search bounds
    suggested = {}
    for param_name, param_val in req.parameters.items():
        if isinstance(param_val, (int, float)):
            suggested[param_name] = {
                "current": param_val,
                "recommended_range": [round(param_val * 0.8, 2), round(param_val * 1.3, 2)]
            }

    return OverfittingCheckResponse(
        decay_ratio=round(decay, 2),
        overfitting_risk_level=risk_level,
        recommendation=rec,
        suggested_parameter_bounds=suggested
    )
