import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import structlog

from database import init_db
from middleware.rate_limiter import check_rate_limit
from routers import (
    auth_router,
    credentials_router,
    strategies_router,
    backtest_router,
    orders_router,
    positions_router,
    ws_router,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup DB initialization
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.warning(f"Database init warning: {str(e)}")
    yield


app = FastAPI(
    title="Multi-Tenant Automated Trading Bot Platform API",
    description="Production-Grade Algorithmic Trading API supporting Equities (Alpaca) & Crypto (KuCoin)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    if not request.url.path.startswith("/ws"):
        try:
            await check_rate_limit(request, limit=120, window_seconds=60)
        except Exception as e:
            pass  # Allow through if Redis is unavailable in dev
    response = await call_next(request)
    return response


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error": str(exc)},
    )


# Register Routers
app.include_router(auth_router.router)
app.include_router(credentials_router.router)
app.include_router(strategies_router.router)
app.include_router(backtest_router.router)
app.include_router(orders_router.router)
app.include_router(positions_router.router)
app.include_router(ws_router.router)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Automated Trading Platform API Gateway",
        "version": "1.0.0",
    }
