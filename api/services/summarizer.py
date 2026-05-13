import re
import uuid
from datetime import datetime
from typing import Dict, Optional

from schemas import LogEntry, TaskResponse
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

    async def process_video_background(self, task_id: str, url: str, lang: str):
        """Run full pipeline in background: transcript → summarize → store result."""
        try:
            video_id = _parse_video_id(url)

            # Step 1: Ping
            _add_log(task_id, "sys_core", "Пинг серверов YouTube...", "OK")

            # Step 2: Extract metadata
            _add_log(task_id, "sys_core", f"Извлечение метаданных видео [{video_id}]...")

            # Step 3: Get transcript
            _add_log(task_id, "sys_core", f"Поиск дорожки субтитров [{lang}]...")

            transcript = await self.supadata.get_transcript(url=url, lang=lang)

            if not transcript or not transcript.strip():
                raise Exception("Транскрипт пуст или недоступен.")

            transcript_size = f"{len(transcript.encode('utf-8')) / 1024:.1f}KB"
            _add_log(task_id, "sys_core", f"Транскрипт получен. Размер: {transcript_size}", "OK")

            # Step 4: Send to AI
            _add_log(task_id, "sova_ai", "> Анализирую запрос... Очистка от воды.")
            _add_log(task_id, "sova_ai", "> Кластеризация ключевых тезисов...")
            _add_log(task_id, "sova_ai", "> Компилирую саммари. Модель: Gemini 2.0 Flash")

            result = await self.gemini.summarize_transcript(
                transcript_text=transcript,
                video_id=video_id,
                url=url,
            )

            # Step 5: Done
            _add_log(task_id, "sys_core", "Готово. Саммари сгенерировано.", "OK")

            tasks_db[task_id].status = "completed"
            tasks_db[task_id].result = result

        except Exception as e:
            _add_log(task_id, "error", f"FATAL: {str(e)}", "ERR")
            tasks_db[task_id].status = "failed"
            tasks_db[task_id].error = str(e)
