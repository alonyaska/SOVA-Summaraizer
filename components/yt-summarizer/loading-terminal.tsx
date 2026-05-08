"use client"

import { useEffect, useRef, useState } from "react"
import type { LogLine } from "@/lib/yt-summarizer"
import type { Mode } from "./mode-toggle"
import { cn } from "@/lib/utils"

type Props = {
  mode: Mode
  log: LogLine[]
  onComplete?: () => void
  cached?: boolean
  live?: boolean // true = logs come from polling, show all immediately
}

const STEP_DELAY_MIN = 280
const STEP_DELAY_MAX = 620

export function LoadingTerminal({ mode, log, onComplete, cached, live }: Props) {
  const [visibleCount, setVisibleCount] = useState(0)
  const completedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Live mode: show all logs as they arrive from backend
  useEffect(() => {
    if (live) {
      setVisibleCount(log.length)
    }
  }, [live, log.length])

  // Static mode: reveal log lines one by one (original behavior)
  useEffect(() => {
    if (live) return // skip for live mode

    completedRef.current = false
    setVisibleCount(0)
    let cancelled = false
    let i = 0

    function tick() {
      if (cancelled) return
      i += 1
      setVisibleCount(i)
      if (i < log.length) {
        const delay =
          STEP_DELAY_MIN + Math.random() * (STEP_DELAY_MAX - STEP_DELAY_MIN)
        timeoutId = window.setTimeout(tick, delay)
      } else if (!completedRef.current) {
        completedRef.current = true
        timeoutId = window.setTimeout(() => {
          if (!cancelled && onComplete) onComplete()
        }, 380)
      }
    }

    let timeoutId = window.setTimeout(tick, 220)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [log, onComplete, live])

  // Auto-scroll to bottom
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visibleCount])

  const visible = log.slice(0, visibleCount)

  return (
    <section
      aria-live="polite"
      aria-label="Обработка запроса"
      className="mx-auto w-full max-w-5xl px-4 sm:px-8"
    >
      <div
        className={cn(
          "rounded-sm border bg-card font-mono text-sm",
          mode === "hardcore" ? "border-primary/40 glow-primary" : "border-border",
        )}
      >
        {/* chrome */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-block h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-primary">PROCESSING</span>
            <span aria-hidden>·</span>
            <span>sova_core.exec()</span>
          </div>
          {cached && (
            <span className="rounded-sm bg-warning/15 px-1.5 py-0.5 text-warning">
              cache_lookup
            </span>
          )}
        </div>

        <div
          ref={containerRef}
          className="term-scroll max-h-[320px] overflow-y-auto px-4 py-4 leading-relaxed"
        >
          {visible.map((line, idx) => (
            <LogRow key={idx} line={line} />
          ))}
          {/* working cursor — show while still processing */}
          {(live || visibleCount < log.length) && (
            <div className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Spinner />
              <span>working...</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function LogRow({ line }: { line: LogLine }) {
  const sourceClass =
    line.source === "sova_ai"
      ? "text-primary"
      : line.source === "error"
        ? "text-destructive"
        : line.source === "info"
          ? "text-warning"
          : "text-success"

  const statusClass =
    line.status === "OK"
      ? "text-success"
      : line.status === "ERR"
        ? "text-destructive"
        : line.status === "WARN"
          ? "text-warning"
          : ""

  return (
    <div className="whitespace-pre-wrap break-words text-foreground/90">
      <span className="text-muted-foreground">[{line.time}]</span>{" "}
      <span className={sourceClass}>{line.source}:</span>{" "}
      <span>{line.text}</span>
      {line.status && (
        <span className={cn("ml-1", statusClass)}>[{line.status}]</span>
      )}
    </div>
  )
}

function Spinner() {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % frames.length), 90)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <span className="text-primary">{frames[i]}</span>
}
