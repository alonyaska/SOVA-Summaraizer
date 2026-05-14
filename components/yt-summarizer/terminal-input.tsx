"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { ChevronRight, Play, X } from "lucide-react"
import type { Mode } from "./mode-toggle"
import { isValidYouTubeUrl } from "@/lib/yt-summarizer"
import { cn } from "@/lib/utils"

type Props = {
  mode: Mode
  disabled?: boolean
  onSubmit: (url: string) => void
}

const PROMPT = "sys_admin@sova:~/yt-summary$"

export function TerminalInput({ mode, disabled, onSubmit }: Props) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (disabled) return
    const trimmed = url.trim()
    if (!trimmed) {
      setError("Empty input. Paste a YouTube URL.")
      return
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setError("Invalid YouTube URL pattern")
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  if (mode === "casual") {
    return (
      <section aria-label="Ввод ссылки" className="mx-auto w-full max-w-3xl px-4 sm:px-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="yt-url" className="block font-sans text-sm font-medium text-foreground">
            Ссылка на YouTube
          </label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border bg-card p-1.5 transition-colors",
              error ? "border-destructive" : "border-border focus-within:border-primary",
            )}
          >
            <input
              ref={inputRef}
              id="yt-url"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://youtu.be/..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              disabled={disabled}
              className="flex-1 bg-transparent px-3 py-2 font-sans text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            {url && !disabled && (
              <button
                type="button"
                onClick={() => setUrl("")}
                aria-label="очистить"
                className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={disabled || !url}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" aria-hidden />
              Сделать саммари
            </button>
          </div>
          {error && (
            <p role="alert" className="font-sans text-sm text-destructive">
              {error}
            </p>
          )}
        </form>
      </section>
    )
  }

  // -- Hardcore terminal mode ------------------------------------
  return (
    <section aria-label="Командная строка" className="mx-auto w-full max-w-5xl px-4 sm:px-8">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "rounded-sm border bg-card font-mono text-sm transition-colors",
          error
            ? "border-destructive/60"
            : focused
              ? "border-primary/60 glow-primary"
              : "border-border",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {/* terminal chrome */}
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-2">- bash - sova_yt_parser</span>
          </div>
          <span className="hidden sm:inline">PID 4137 . TTY pts/0</span>
        </div>

        <div className="flex items-start gap-2 px-4 py-4 sm:py-5">
          <ChevronRight className="mt-[3px] h-4 w-4 shrink-0 text-primary" aria-hidden />
          <label htmlFor="yt-url-term" className="sr-only">
            YouTube URL
          </label>
          <div className="flex-1 leading-relaxed">
            <span className="text-success">{PROMPT}</span>{" "}
            <span className="relative inline-flex max-w-full items-center align-middle">
              <input
                ref={inputRef}
                id="yt-url-term"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="paste youtube url and press Enter"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={disabled}
                className="w-full min-w-0 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50 sm:text-base"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "yt-url-error" : undefined}
              />
            </span>
            {/* blinking caret when empty + focused */}
            {!url && focused && !disabled && (
              <span
                aria-hidden
                className="cursor-blink pointer-events-none -ml-[0.6ch] inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-primary align-middle"
              />
            )}
          </div>
        </div>

        {/* execute bar */}
        <div className="flex flex-col-reverse gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-[11px] text-muted-foreground">
            <kbd className="rounded-sm border border-border bg-background px-1.5 py-0.5">Enter</kbd>{" "}
            to execute .{" "}
            <kbd className="rounded-sm border border-border bg-background px-1.5 py-0.5">Esc</kbd>{" "}
            to clear
          </div>
          <button
            type="submit"
            disabled={disabled || !url}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors",
              "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <span className="text-primary/70">{"<"}</span>
            EXECUTE
            <span className="text-primary/70">{"/>"}</span>
          </button>
        </div>
      </form>

      {error && (
        <p
          id="yt-url-error"
          role="alert"
          className="mt-3 font-mono text-xs text-destructive"
        >
          <span className="rounded-sm bg-destructive/15 px-1.5 py-0.5">[ERROR]</span> {error}
        </p>
      )}

      {/* hint examples */}
      {!disabled && !error && (
        <ul className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
          <li>{"// try:"}</li>
          {[
            "https://youtu.be/dQw4w9WgXcQ",
            "https://www.youtube.com/watch?v=9bZkp7q19f0",
          ].map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  setUrl(ex)
                  setError(null)
                  inputRef.current?.focus()
                }}
                className="rounded-sm border border-border px-2 py-0.5 hover:border-primary/50 hover:text-primary"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
