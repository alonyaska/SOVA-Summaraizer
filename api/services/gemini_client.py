import json
import asyncio
from google import genai
from config import settings
from schemas import SummaryBullet, SummaryResult


class GeminiAdapter:
    """Adapter for Google Gemini 2.5 Flash API."""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemma-4-26b-a4b-it"

    async def summarize_transcript(self, transcript_text: str, video_id: str, url: str) -> SummaryResult:
        """Send transcript to Gemini and get structured summary back."""
        prompt = f"""Ты профессиональный редактор и аналитик видеоконтента. 
Прочитай следующий транскрипт YouTube видео и извлеки из него структурированную информацию.

Верни ответ СТРОГО в формате JSON (без markdown-обёртки, без ```json```) со следующими ключами:
- "title": (строка) Название/тема видео, сформулированная на основе контента (1 предложение)
- "channel": (строка) Если упоминается автор/канал — укажи, иначе напиши "Unknown"
- "duration_original": (строка) Примерная длительность видео в формате "MM:SS" (оцени по объёму текста)
- "duration_read": (строка) Примерное время чтения саммари в формате "M:SS"
- "main_idea": (строка) Основная идея видео в 1-3 предложениях
- "key_points": (массив объектов) От 3 до 7 главных тезисов. Каждый объект: {{"timecode": "MM:SS", "text": "тезис"}}
  Таймкоды можешь расставить примерно, равномерно по длине видео.

Транскрипт:
---
{transcript_text}
---"""

        response = await asyncio.to_thread(
            self.client.models.generate_content,
            model=self.model_name,
            contents=prompt,
        )

        raw_text = response.text.strip()

        # Clean markdown wrapping if present
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError as e:
            raise Exception(
                f"Gemini вернул невалидный JSON: {e}\nОтвет: {response.text[:500]}"
            )

        # Map key_points to SummaryBullet objects
        bullets = []
        for kp in parsed.get("key_points", []):
            if isinstance(kp, dict):
                bullets.append(SummaryBullet(
                    timecode=kp.get("timecode", "00:00"),
                    text=kp.get("text", ""),
                ))
            elif isinstance(kp, str):
                bullets.append(SummaryBullet(timecode="00:00", text=kp))

        return SummaryResult(
            video_id=video_id,
            url=url,
            title=parsed.get("title", "Без названия"),
            channel=parsed.get("channel", "Unknown"),
            duration_original=parsed.get("duration_original", "00:00"),
            duration_read=parsed.get("duration_read", "0:30"),
            main_idea=parsed.get("main_idea", ""),
            key_points=bullets,
            cached=False,
        )
