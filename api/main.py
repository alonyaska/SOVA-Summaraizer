import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

# Add current directory to path so that 'routers', 'services' etc. can be imported
# when running from the project root (e.g. on Vercel)
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import video
from services.summarizer import VideoSummarizerService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application lifecycle — init services on startup, cleanup on shutdown."""
    # Startup: create service instances and attach to app.state
    summarizer = VideoSummarizerService()
    app.state.summarizer = summarizer
    yield
    # Shutdown: cleanup resources
    app.state.summarizer = None


app = FastAPI(
    title="SOVA YT Summarizer API",
    version="1.0.0",
    description="Микросервис суммаризации YouTube видео через Supadata + Gemma 4 26B",
    lifespan=lifespan,
)

# CORS — allow Next.js dev server and Vercel production domain
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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sova-yt-summarizer"}