/**
 * API client for SOVA YT Summarizer backend.
 * Handles task creation and polling.
 */

const API_BASE = "" // Proxied via next.config.mjs rewrites

// ── Types matching backend schemas ──────────────────────────────

export type ApiLogEntry = {
  time: string
  source: string
  text: string
  status?: string | null
}

export type ApiBullet = {
  timecode: string
  text: string
}

export type ApiSummaryResult = {
  video_id: string
  url: string
  title: string
  channel: string
  duration_original: string
  duration_read: string
  main_idea: string
  key_points: ApiBullet[]
  cached: boolean
}

export type ApiTaskResponse = {
  task_id: string
  status: "processing" | "completed" | "failed"
  result?: ApiSummaryResult | null
  error?: string | null
  logs: ApiLogEntry[]
}

// ── API calls ───────────────────────────────────────────────────

export async function startSummarization(
  url: string,
  lang: string = "ru",
): Promise<ApiTaskResponse> {
  const res = await fetch(`${API_BASE}/api/v1/videos/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, lang }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Backend error ${res.status}: ${text}`)
  }
  return res.json()
}

export async function pollTaskStatus(
  taskId: string,
): Promise<ApiTaskResponse> {
  const res = await fetch(`${API_BASE}/api/v1/videos/task/${taskId}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Poll error ${res.status}: ${text}`)
  }
  return res.json()
}

// ── Mapper: backend → frontend types ────────────────────────────

import type { SummaryResult, LogLine } from "./yt-summarizer"

export function mapApiResultToFrontend(api: ApiSummaryResult, url: string): SummaryResult {
  return {
    videoId: api.video_id,
    url: url,
    title: api.title,
    channel: api.channel,
    durationOriginal: api.duration_original,
    durationRead: api.duration_read,
    tldr: api.main_idea,
    bullets: api.key_points.map((kp) => ({
      timecode: kp.timecode,
      text: kp.text,
    })),
    cached: api.cached,
  }
}

export function mapApiLogsToFrontend(apiLogs: ApiLogEntry[]): LogLine[] {
  return apiLogs.map((log) => ({
    time: log.time,
    source: log.source as LogLine["source"],
    text: log.text,
    status: log.status as LogLine["status"],
  }))
}
