"""
Vercel ASGI entry point.
Vercel auto-detects this file and exposes it at /api.
Re-exports the FastAPI application.
"""
import sys
import os
from pathlib import Path

current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import video
from services.summarizer import VideoSummarizerService
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    summarizer = VideoSummarizerService()
    app.state.summarizer = summarizer
    yield
    app.state.summarizer = None


app = FastAPI(
    title="SOVA YT Summarizer API",
    version="1.0.0",
    description="Микросервис суммаризации YouTube видео через Supadata + Gemma 4 26B",
    lifespan=lifespan,
)

# CORS
VERCEL_URL = os.environ.get("VERCEL_URL", "")
PROD_ORIGIN = f"https://{VERCEL_URL}" if VERCEL_URL else ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        PROD_ORIGIN,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch all unhandled exceptions and return them in the response."""
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "traceback": traceback.format_exc(),
        },
    )


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sova-yt-summarizer"}