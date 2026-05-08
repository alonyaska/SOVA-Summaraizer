"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Hero } from "@/components/yt-summarizer/hero"
import { TerminalInput } from "@/components/yt-summarizer/terminal-input"
import { LoadingTerminal } from "@/components/yt-summarizer/loading-terminal"
import { OutputWindow } from "@/components/yt-summarizer/output-window"
import type { Mode, Theme } from "@/lib/yt-summarizer"
import type { LogLine, SummaryResult } from "@/lib/yt-summarizer"
import {
  startSummarization,
  pollTaskStatus,
  mapApiResultToFrontend,
  mapApiLogsToFrontend,
} from "@/lib/api-client"

type Phase =
  | { kind: "idle" }
  | { kind: "loading"; url: string; taskId: string; log: LogLine[]; cached: boolean }
  | { kind: "error"; message: string }
  | { kind: "result"; result: SummaryResult }

const POLL_INTERVAL = 2000 // ms

export default function Page() {
  const [mode, setMode] = useState<Mode>("hardcore")
  const [theme, setTheme] = useState<Theme>("blue")
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const pollingRef = useRef<number | null>(null)

  // Sync mode → <html class="dark"> and theme → <html class="theme-youtube">
  useEffect(() => {
    const root = document.documentElement
    // Add dark on mount (initial state is hardcore)
    root.classList.add("dark")
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (mode === "hardcore") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    if (theme === "youtube") {
      root.classList.add("theme-youtube")
    } else {
      root.classList.remove("theme-youtube")
    }
  }, [theme])

  // ── Polling logic ─────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current !== null) {
      window.clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const startPolling = useCallback(
    (taskId: string, url: string) => {
      stopPolling()

      const id = window.setInterval(async () => {
        try {
          const task = await pollTaskStatus(taskId)

          // Update logs in loading phase
          setPhase((prev) => {
            if (prev.kind !== "loading") return prev
            const newLogs = mapApiLogsToFrontend(task.logs)
            return { ...prev, log: newLogs }
          })

          if (task.status === "completed" && task.result) {
            stopPolling()
            const mapped = mapApiResultToFrontend(task.result, url)
            setPhase({ kind: "result", result: mapped })
          } else if (task.status === "failed") {
            stopPolling()
            setPhase({
              kind: "error",
              message: task.error || "Неизвестная ошибка бэкенда",
            })
          }
        } catch (err) {
          // Network error — keep polling, backend might be slow
          console.error("[SOVA] Poll error:", err)
        }
      }, POLL_INTERVAL)

      pollingRef.current = id
    },
    [stopPolling],
  )

  // ── Submit handler ────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (url: string) => {
      try {
        // Start loading phase immediately with empty log
        setPhase({
          kind: "loading",
          url,
          taskId: "",
          log: [
            {
              time: new Date().toLocaleTimeString("ru-RU", { hour12: false }),
              source: "sys_core",
              text: "Инициализация задачи...",
            },
          ],
          cached: false,
        })

        const task = await startSummarization(url)

        setPhase((prev) => {
          if (prev.kind !== "loading") return prev
          return {
            ...prev,
            taskId: task.task_id,
            log: [
              ...prev.log,
              {
                time: new Date().toLocaleTimeString("ru-RU", { hour12: false }),
                source: "sys_core" as const,
                text: `Задача создана. ID: ${task.task_id.slice(0, 8)}...`,
                status: "OK" as const,
              },
            ],
          }
        })

        // Start polling
        startPolling(task.task_id, url)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setPhase({ kind: "error", message: `Не удалось подключиться к бэкенду: ${msg}` })
      }
    },
    [startPolling],
  )

  const handleNewQuery = useCallback(() => {
    stopPolling()
    setPhase({ kind: "idle" })
  }, [stopPolling])

  // Esc clears (resets to idle)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && phase.kind !== "idle") {
        e.preventDefault()
        stopPolling()
        setPhase({ kind: "idle" })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase.kind, stopPolling])

  return (
    <main
      className={
        mode === "hardcore"
          ? "scanlines crt-flicker min-h-svh bg-background text-foreground"
          : "min-h-svh bg-background text-foreground"
      }
    >
      <Hero 
        mode={mode} 
        theme={theme}
        onModeChange={setMode}
        onThemeChange={setTheme}
      />

      <div className="space-y-8 py-10 sm:py-14">
        <TerminalInput
          mode={mode}
          disabled={phase.kind === "loading"}
          onSubmit={handleSubmit}
        />

        {phase.kind === "loading" && (
          <LoadingTerminal
            mode={mode}
            log={phase.log}
            cached={phase.cached}
            live={true}
          />
        )}

        {phase.kind === "error" && (
          <section className="mx-auto w-full max-w-5xl px-4 sm:px-8">
            <div className="rounded-sm border border-destructive/60 bg-card p-4 font-mono text-sm">
              <div className="flex items-center gap-2 text-destructive">
                <span className="rounded-sm bg-destructive/15 px-1.5 py-0.5 text-[11px]">[FATAL]</span>
                <span>{phase.message}</span>
              </div>
              <button
                onClick={handleNewQuery}
                className="mt-4 inline-flex items-center gap-2 rounded-sm border border-primary/50 bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary hover:bg-primary/20"
              >
                {"<"} RETRY {"/>"}
              </button>
            </div>
          </section>
        )}

        {phase.kind === "result" && (
          <OutputWindow
            result={phase.result}
            mode={mode}
            onNewQuery={handleNewQuery}
          />
        )}

        {phase.kind === "idle" && <FeatureGrid mode={mode} />}
      </div>

      <Footer mode={mode} />
    </main>
  )
}

function FeatureGrid({ mode }: { mode: Mode }) {
  const items = [
    {
      tag: "01",
      title: mode === "hardcore" ? "fast_extract()" : "Быстрое извлечение",
      desc:
        "Парсинг субтитров напрямую через Supadata API. Без скачивания видео — секунды до текста.",
    },
    {
      tag: "02",
      title: mode === "hardcore" ? "smart_summary()" : "Умная выжимка",
      desc:
        "Gemini 2.5 Flash кластеризует мысли, режет воду и сохраняет структуру оригинала с таймкодами.",
    },
    {
      tag: "03",
      title: mode === "hardcore" ? "cache_layer" : "Кэш-слой",
      desc:
        "Популярные видео отдаются за 0.1с из кэша. Без повторных дёрганий AI и лишних расходов.",
    },
    {
      tag: "04",
      title: mode === "hardcore" ? "whisper_fallback" : "Whisper fallback",
      desc:
        "Если субтитров нет — аудио прогоняется через Whisper. Любое видео, любой язык.",
    },
  ]

  return (
    <section
      aria-label="Возможности"
      className="mx-auto w-full max-w-5xl px-4 sm:px-8"
    >
      <div className="mb-4 flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>{"// CAPABILITIES"}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.tag}
            className="group rounded-sm border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 text-primary">
                {it.tag}
              </span>
              <span>module.ready</span>
              <span className="ml-auto inline-block h-1.5 w-1.5 rounded-full bg-success" />
            </div>
            <h3
              className={
                mode === "hardcore"
                  ? "mt-3 font-mono text-base text-foreground"
                  : "mt-3 font-sans text-lg font-semibold text-foreground"
              }
            >
              {it.title}
            </h3>
            <p
              className={
                mode === "hardcore"
                  ? "mt-1.5 font-mono text-sm leading-relaxed text-muted-foreground"
                  : "mt-1.5 font-sans text-sm leading-relaxed text-muted-foreground"
              }
            >
              {it.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer({ mode }: { mode: Mode }) {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 py-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:px-8">
        <div className="flex items-center gap-2">
          <span className="text-primary">{"<SOVA>"}</span>
          <span aria-hidden>·</span>
          <span>YT_SUMMARIZER</span>
          <span aria-hidden>·</span>
          <span>part of SOVA Playground</span>
        </div>
        <div className="flex items-center gap-3">
          <span>build {mode === "hardcore" ? "0xCAFE" : "casual.1"}</span>
          <span aria-hidden>·</span>
          <span className="text-success">● online</span>
        </div>
      </div>
    </footer>
  )
}
