"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Clock, Copy, Database, Download, Hash, Plus, Tv } from "lucide-react"
import type { SummaryResult, Mode as ModeType } from "@/lib/yt-summarizer"
import { generateTypoEffect } from "@/lib/yt-summarizer"
import type { Mode } from "./mode-toggle"
import { cn } from "@/lib/utils"

type Props = {
  result: SummaryResult
  mode: Mode
  onNewQuery: () => void
}

// Typewriter effect — characters per tick
const TW_CHARS_PER_TICK = 3
const TW_INTERVAL_MS = 16

function useTypewriterWithTypo(text: string) {
  const [shown, setShown] = useState(0)
  const [step, setStep] = useState(0)
  
  const typo = useMemo(() => generateTypoEffect(text, 0.05), [text])

  useEffect(() => {
    setShown(0)
    setStep(0)
    let cancelled = false

    if (!typo.hasTypo) {
      // Normal typewriter
      const id = window.setInterval(() => {
        if (cancelled) return
        setShown((s) => {
          const next = s + TW_CHARS_PER_TICK
          if (next >= text.length) {
            window.clearInterval(id)
            return text.length
          }
          return next
        })
      }, TW_INTERVAL_MS)
      return () => {
        cancelled = true
        window.clearInterval(id)
      }
    } else {
      // Typo effect: go through all steps
      const id = window.setInterval(() => {
        if (cancelled) return
        setStep((s) => {
          if (s >= typo.steps.length - 1) {
            window.clearInterval(id)
            return typo.steps.length - 1
          }
          return s + 1
        })
      }, TW_INTERVAL_MS)
      return () => {
        cancelled = true
        window.clearInterval(id)
      }
    }
  }, [text, typo])

  const rendered = typo.hasTypo ? typo.steps[step] || "" : text.slice(0, shown)
  const done = typo.hasTypo ? step >= typo.steps.length - 1 : shown >= text.length

  return { rendered, done }
}

export function OutputWindow({ result, mode, onNewQuery }: Props) {
  const isHardcore = mode === "hardcore"
  const { rendered: tldrText, done: tldrDone } = useTypewriterWithTypo(result.tldr)
  const [revealedBullets, setRevealedBullets] = useState(0)
  const [copied, setCopied] = useState(false)

  // Reveal bullets after TL;DR finishes
  useEffect(() => {
    if (!tldrDone) return
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setRevealedBullets(i)
      if (i >= result.bullets.length) window.clearInterval(id)
    }, 140)
    return () => window.clearInterval(id)
  }, [tldrDone, result.bullets.length])

  const plainText = useMemo(() => {
    const lines = [
      `${result.title} — ${result.channel}`,
      `Длительность: ${result.durationOriginal} → чтение: ${result.durationRead}`,
      `Источник: ${result.url}`,
      "",
      `TL;DR: ${result.tldr}`,
      "",
      "Ключевые тезисы:",
      ...result.bullets.map((b) => `  [${b.timecode}] ${b.text}`),
    ]
    return lines.join("\n")
  }, [result])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plainText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (err) {
      console.log("[v0] clipboard error:", err)
    }
  }

  function handleExport() {
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sova_summary_${result.videoId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-label="Результат анализа" className="mx-auto w-full max-w-5xl px-4 sm:px-8">
      <div
        className={cn(
          "overflow-hidden rounded-sm border bg-card font-mono",
          isHardcore ? "border-primary/30 glow-primary" : "border-border",
        )}
      >
        {/* chrome */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-2">summary_{result.videoId}.log</span>
          </div>
          <div className="flex items-center gap-3">
            {result.cached && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-warning/15 px-1.5 py-0.5 text-warning">
                <Database className="h-3 w-3" aria-hidden />
                CACHE_HIT
              </span>
            )}
            <span className="hidden sm:inline">UTF-8 · txt</span>
          </div>
        </div>

        {/* metadata */}
        <div className="grid gap-3 border-b border-border px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {"// metadata"}
            </div>
            <h2
              className={cn(
                "mt-1 text-pretty text-base font-semibold leading-snug text-foreground sm:text-lg",
                !isHardcore && "font-sans",
              )}
            >
              {result.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5" aria-hidden />
                {result.channel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span className="text-foreground">{result.durationOriginal}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-success">{result.durationRead} read</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5" aria-hidden />
                {result.videoId}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <ActionButton onClick={handleCopy} ariaLabel="Скопировать саммари">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden /> COPIED
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden /> COPY_TO_CLIPBOARD
                </>
              )}
            </ActionButton>
            <ActionButton onClick={handleExport} ariaLabel="Экспортировать в .txt">
              <Download className="h-3.5 w-3.5" aria-hidden /> EXPORT_TXT
            </ActionButton>
            <ActionButton onClick={onNewQuery} ariaLabel="Новый запрос" variant="primary">
              <Plus className="h-3.5 w-3.5" aria-hidden /> NEW_QUERY
            </ActionButton>
          </div>
        </div>

        {/* TL;DR */}
        <div className="border-b border-border px-4 py-4">
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            TL;DR
          </div>
          <p
            className={cn(
              "text-pretty text-sm leading-relaxed text-foreground sm:text-base",
              !isHardcore && "font-sans",
            )}
          >
            {tldrText}
            {!tldrDone && (
              <span
                aria-hidden
                className="cursor-blink ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-primary align-middle"
              />
            )}
          </p>
        </div>

        {/* Bullets */}
        <div className="px-4 py-4">
          <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
            <span>{"// key_points"}</span>
            <span>
              {Math.min(revealedBullets, result.bullets.length)} / {result.bullets.length}
            </span>
          </div>
          <ol className="space-y-2.5">
            {result.bullets.slice(0, revealedBullets).map((b, i) => (
              <li
                key={`${b.timecode}-${i}`}
                className="group flex gap-3 rounded-sm border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/40"
              >
                <span className="mt-[2px] inline-flex h-fit shrink-0 items-center gap-1 rounded-sm border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">
                  {b.timecode}
                </span>
                <span
                  className={cn(
                    "text-sm leading-relaxed text-foreground/95",
                    !isHardcore && "font-sans",
                  )}
                >
                  {b.text}
                </span>
              </li>
            ))}
          </ol>

          {revealedBullets >= result.bullets.length && (
            <div className="mt-5 flex items-center gap-2 border-t border-dashed border-border pt-4 text-[11px] text-muted-foreground">
              <span className="text-success">$</span> process exited with code{" "}
              <span className="text-success">0</span>
              <span className="cursor-blink ml-1 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-muted-foreground/60 align-middle" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ActionButton({
  children,
  onClick,
  ariaLabel,
  variant = "default",
}: {
  children: React.ReactNode
  onClick: () => void
  ariaLabel: string
  variant?: "default" | "primary"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[11px] transition-colors",
        variant === "primary"
          ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
