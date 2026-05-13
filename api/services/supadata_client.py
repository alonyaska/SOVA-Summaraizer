import time
import asyncio
from supadata import Supadata
from config import settings


class SupadataAdapter:
    """Adapter for Supadata transcript API with job polling support."""

    def __init__(self):
        self.client = Supadata(api_key=settings.SUPADATA_API_KEY)

    async def get_transcript(self, url: str, lang: str = "ru") -> str:
        """Get transcript for a YouTube video. Handles both sync and async (job) responses."""
        return await asyncio.to_thread(self._fetch_transcript_sync, url, lang)

    def _fetch_transcript_sync(self, url: str, lang: str) -> str:
        """Synchronous transcript fetching with job polling fallback."""
        try:
            # Note: SDK methods might return dataclasses or strings depending on parameters
            res = self.client.transcript(
                url=url,
                lang=lang,
                text=True,
                mode="auto"
            )

            # Check if it's a Transcript object (immediate result)
            if hasattr(res, "content") and res.content:
                return res.content

            # Check if it's a BatchJob object (async result)
            if hasattr(res, "job_id") and res.job_id:
                return self._poll_job(res.job_id)

            # Fallback for unexpected types
            if isinstance(res, str):
                return res

            raise Exception(f"Неожиданный формат ответа Supadata: {type(res)}")

        except Exception as e:
            raise Exception(f"Ошибка Supadata API: {str(e)}")

    def _poll_job(self, job_id: str, max_attempts: int = 120, interval: float = 2.0) -> str:
        """Poll Supadata batch results until completion."""
        for _ in range(max_attempts):
            try:
                batch_results = self.client.youtube.batch.get_batch_results(job_id)

                if batch_results.status == "completed":
                    # Batch results contain a list of results
                    for item in batch_results.results:
                        if item.transcript and item.transcript.content:
                            return item.transcript.content
                        if item.error_code:
                            raise Exception(f"Ошибка в задаче Supadata: {item.error_code}")
                    
                    raise Exception("Задача завершена, но транскрипт не найден в результатах.")

                if batch_results.status == "failed":
                    raise Exception("Задача Supadata завершилась с ошибкой.")

            except Exception as e:
                if "Задача" in str(e):
                    raise
                # Transient error or still processing, keep polling

            time.sleep(interval)

        raise Exception("Превышено время ожидания транскрипта (timeout).")
