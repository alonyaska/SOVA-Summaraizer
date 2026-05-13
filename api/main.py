import sys
import os
from pathlib import Path

# Add current directory to path so that 'routers', 'services' etc. can be imported
# when running from the project root (e.g. on Vercel)
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import video

app = FastAPI(
    title="SOVA YT Summarizer API",
    version="1.0.0",
    description="Микросервис суммаризации YouTube видео через Supadata + Gemini 2.0 Flash",
)

# CORS — allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(video.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sova-yt-summarizer"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
