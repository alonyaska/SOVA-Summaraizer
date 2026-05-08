from pydantic import BaseModel
from typing import List, Optional


class VideoRequest(BaseModel):
    url: str
    lang: str = "ru"


class SummaryBullet(BaseModel):
    timecode: str
    text: str


class SummaryResult(BaseModel):
    video_id: str
    url: str
    title: str
    channel: str
    duration_original: str
    duration_read: str
    main_idea: str
    key_points: List[SummaryBullet]
    cached: bool = False


class LogEntry(BaseModel):
    time: str
    source: str  # "sys_core" | "sova_ai" | "error" | "info"
    text: str
    status: Optional[str] = None  # "OK" | "ERR" | "WARN"


class TaskResponse(BaseModel):
    task_id: str
    status: str  # "processing" | "completed" | "failed"
    result: Optional[SummaryResult] = None
    error: Optional[str] = None
    logs: List[LogEntry] = []
