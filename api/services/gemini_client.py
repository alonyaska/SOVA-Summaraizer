import json
import asyncio
from google import genai
from config import settings
from schemas import SummaryBullet, SummaryResult


class GeminiAdapter:
    """Adapter for Google Gemini 2.5 Flash API."""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "models/gemini-2.5-flash"

    async def summarize_transcript(self, transcript_text: str, video_id: str, url: str) -> SummaryResult:
        """Send transcript to Gemini and get structured summary back."""
        prompt = f"""Ты профессиональный редактор, аналитик видеоконтента и конспект-мейкер. 
Прочитай следующий транскрипт YouTube видео и извлеки из него глубокую структурированную информацию.

Верни ответ СТРОГО в формате JSON (без markdown-обёртки, без ```json```, без лишних слов) со следующими ключами:

- "title": (строка) оптимизированное, кликабельное название видео на основе контента.
- "category": (строка) Тип видео (например: Подкаст, Туториал, Обзор, Новости, Влог, Лекция).
- "tone": (строка) Тональность спикера (например: академичный, развлекательный, агрессивный).
- "target_audience": (строка) Кому будет полезно это видео (1 предложение).
- "duration_read": (строка) Примерное время чтения этого саммари (например: "2 мин").
- "main_idea": (строка) Главная мысль или суть видео в 1-2 предложениях.
- "key_points": (массив объектов) От 3 до 7 главных тезисов. Формат: {{"timecode": "MM:SS" (если в тексте есть таймкоды - бери их, если нет - пиши "00:00"), "title": "Заголовок тезиса", "description": "Раскрытие тезиса в 1 предложении"}}.
- "action_items": (массив строк) 2-5 практических советов, шагов или выводов, которые можно применить на практике. Если их нет, верни пустой массив.
- "notable_quotes": (массив строк) 1-2 самые яркие цитаты спикера.
- "mentions": (объект) Упомянутые в видео сущности. Ключи: "tools" (сервисы/программы), "people" (личности), "resources" (книги/статьи). Если ничего не упомянуто, оставляй массивы пустыми.
- "tags": (массив строк) 5 релевантных тегов для поиска.

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
                    title=kp.get("title", ""),
                    description=kp.get("description", ""),
                ))

        return SummaryResult(
            video_id=video_id,
            url=url,
            title=parsed.get("title", "Без названия"),
            category=parsed.get("category", "Не определено"),
            tone=parsed.get("tone", "Не определено"),
            target_audience=parsed.get("target_audience", "Для всех"),
            duration_read=parsed.get("duration_read", "0:30"),
            main_idea=parsed.get("main_idea", ""),
            key_points=bullets,
            action_items=parsed.get("action_items", []),
            notable_quotes=parsed.get("notable_quotes", []),
            mentions=parsed.get("mentions", {"tools": [], "people": [], "resources": []}),
            tags=parsed.get("tags", []),
            cached=False,
        )
