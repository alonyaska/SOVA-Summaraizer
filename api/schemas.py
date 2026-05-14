from pydantic import BaseModel
from typing import List, Optional


class VideoRequest(BaseModel):
    url: str
    lang: str = "ru"


class SummaryBullet(BaseModel):
    timecode: str
    title: str
    description: str


class Mentions(BaseModel):
    tools: List[str] = []
    people: List[str] = []
    resources: List[str] = []


class SummaryResult(BaseModel):
    video_id: str
    url: str
    title: str
    category: str
    tone: str
    target_audience: str
    duration_read: str
    main_idea: str
    key_points: List[SummaryBullet]
    action_items: List[str] = []
    notable_quotes: List[str] = []
    mentions: Mentions = Mentions()
    tags: List[str] = []
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
