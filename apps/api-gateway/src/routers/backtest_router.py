import pandas as pd
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from common_models import BacktestRequest, BacktestResult, UserSession
from middleware.firebase_auth import get_current_user, security
from strategy_sdk import BacktestingEngine

router = APIRouter(prefix="/api/v1/backtest", tags=["Backtesting Engine"])


@router.post("/run", response_model=BacktestResult)
async def run_backtest(
    req: BacktestRequest,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    # Instantiate strategy engine and run backtest on historical candles
    engine = BacktestingEngine(req)
    # Uses engine's internal synthetic historical bar generator or DB query
    result = engine.run(pd.DataFrame())
    return result
