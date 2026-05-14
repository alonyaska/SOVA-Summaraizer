import re
import uuid
from datetime import datetime
from typing import Dict, Optional

from schemas import LogEntry, SummaryResult, TaskResponse
from services.supadata_client import SupadataAdapter
from services.gemini_client import GeminiAdapter


# In-memory task storage (use Redis/PostgreSQL in production)
tasks_db: Dict[str, TaskResponse] = {}

# YouTube URL regex for extracting video ID
YT_REGEX = re.compile(
    r"^(https?://)?(www\.)?(youtube\.com/(watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{6,})"
)


def _now() -> str:
    return datetime.now().strftime("%H:%M:%S")


def _parse_video_id(url: str) -> str:
    """Extract YouTube video ID from URL."""
    # Strip tracking params
    clean_url = url.split("?si=")[0] if "?si=" in url else url
    m = YT_REGEX.match(clean_url.strip())
    if m:
        return m.group(5)
    # Fallback: try to get last path segment
    parts = url.strip().rstrip("/").split("/")
    candidate = parts[-1].split("?")[0]
    if len(candidate) >= 6:
        return candidate
    return "unknown"


def _add_log(task_id: str, source: str, text: str, status: Optional[str] = None):
    """Append a log entry to the task."""
    if task_id in tasks_db:
        tasks_db[task_id].logs.append(
            LogEntry(time=_now(), source=source, text=text, status=status)
        )


class VideoSummarizerService:
    """Orchestrator: Supadata transcript → Gemini summary."""

    def __init__(self):
        self.supadata = SupadataAdapter()
        self.gemini = GeminiAdapter()

    def create_task(self) -> str:
        task_id = str(uuid.uuid4())
        tasks_db[task_id] = TaskResponse(task_id=task_id, status="processing", logs=[])
        return task_id

    def get_task_status(self, task_id: str) -> Optional[TaskResponse]:
        return tasks_db.get(task_id)

    async def process_video(self, url: str, lang: str) -> SummaryResult:
        """Run full pipeline synchronously: transcript → summarize → return result."""
        video_id = _parse_video_id(url)

        # Step 1: Get transcript
        transcript = await self.supadata.get_transcript(url=url, lang=lang)

        if not transcript or not transcript.strip():
            raise Exception("Транскрипт пуст или недоступен.")

        transcript_size = f"{len(transcript.encode('utf-8')) / 1024:.1f}KB"

        # Step 2: Send to AI
        result = await self.gemini.summarize_transcript(
            transcript_text=transcript,
            video_id=video_id,
            url=url,
        )

        return result
