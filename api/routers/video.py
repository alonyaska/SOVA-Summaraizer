from fastapi import APIRouter, BackgroundTasks, HTTPException
from schemas import VideoRequest, TaskResponse
from services.summarizer import VideoSummarizerService

router = APIRouter(prefix="/api/v1/videos", tags=["Videos"])

# Single service instance
summarizer_service = VideoSummarizerService()


@router.post("/summarize", response_model=TaskResponse)
async def start_summarization(
    request: VideoRequest,
    background_tasks: BackgroundTasks,
):
    """Start async video summarization. Returns task_id immediately."""
    task_id = summarizer_service.create_task()

    background_tasks.add_task(
        summarizer_service.process_video_background,
        task_id=task_id,
        url=request.url,
        lang=request.lang,
    )

    return summarizer_service.get_task_status(task_id)


@router.get("/task/{task_id}", response_model=TaskResponse)
async def get_task_status(task_id: str):
    """Poll task status. Returns logs, status, and result when completed."""
    task = summarizer_service.get_task_status(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
