from typing import Annotated
from fastapi import APIRouter, HTTPException, Request, Depends
from schemas import VideoRequest, SummaryResult
from services.summarizer import VideoSummarizerService

router = APIRouter(prefix="/api/v1/videos", tags=["Videos"])


async def get_summarizer(request: Request) -> VideoSummarizerService:
    """Dependency: get the VideoSummarizerService from app.state."""
    return request.app.state.summarizer


SummarizerDep = Annotated[VideoSummarizerService, Depends(get_summarizer)]


@router.post("/summarize")
async def start_summarization(
    request: VideoRequest,
    summarizer: SummarizerDep,
):
    """Synchronous video summarization. Returns result directly."""
    result = await summarizer.process_video(
        url=request.url,
        lang=request.lang,
    )
    return result


@router.get("/task/{task_id}")
async def get_task_status(
    task_id: str,
    summarizer: SummarizerDep,
):
    """Get task status (legacy endpoint for in-progress polling)."""
    task = summarizer.get_task_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
