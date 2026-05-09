"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ModeToggle } from "./mode-toggle"
import type { Mode, Theme } from "@/lib/yt-summarizer"
import { generateTypoEffect } from "@/lib/yt-summarizer"

type Props = {
  mode: Mode
  theme: Theme
  onModeChange: (mode: Mode) => void
  onThemeChange: (theme: Theme) => void
}

const TITLE_TEXT = "YT_SUMMARIZER"
const TYPE_INTERVAL = 150 // ms per character (increased for human-like feel)

function useTypewriterLoop(text: string, typoChance: number = 0.05) {
  const [step, setStep] = useState(0)
  
  const typo = useMemo(() => generateTypoEffect(text, typoChance), [text, typoChance])
  
  const typingSteps = useMemo(() => {
    if (typo.hasTypo) {
      return typo.steps
    }
    const normalSteps: string[] = []
    for (let i = 0; i <= text.length; i++) {
      normalSteps.push(text.slice(0, i))
    }
    return normalSteps
  }, [text, typo])

  const deletingSteps = useMemo(() => {
    return typingSteps.slice().reverse()
  }, [typingSteps])

  const allSteps = useMemo(() => {
    return [...typingSteps, ...deletingSteps.slice(1)]
  }, [typingSteps, deletingSteps])

  useEffect(() => {
    setStep(0)
    let cancelled = false
    let timeoutId: number

    const tick = (currentStep: number) => {
      if (cancelled) return

      const isFullyTyped = currentStep === typingSteps.length - 1
      const isFullyDeleted = currentStep === allSteps.length - 1
      
      // Determine delay for next step
      let delay = TYPE_INTERVAL + (Math.random() * 80 - 40) // Human variation

      if (isFullyTyped) {
        delay = 3000 // Long pause when the word is complete
      } else if (isFullyDeleted) {
        delay = 1000 // Pause before starting over
      } else if (currentStep >= typingSteps.length) {
        delay = 40 // Deleting is usually faster and more consistent
      }

      timeoutId = window.setTimeout(() => {
        if (cancelled) return
        const nextStep = (currentStep + 1) % allSteps.length
        setStep(nextStep)
        tick(nextStep)
      }, delay)
    }

    tick(0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [allSteps, typingSteps.length])

  const isCursorVisible = step < typingSteps.length - 1
  return { rendered: allSteps[step] || "", isCursorVisible }
}

export function Hero({ mode, theme, onModeChange, onThemeChange }: Props) {
  const isHardcore = mode === "hardcore"
  const { rendered: titleText, isCursorVisible } = useTypewriterLoop(TITLE_TEXT, 0.05)

  return (
    <header className="relative border-b border-border">
      {/* status bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 font-mono text-[11px] text-muted-foreground sm:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/sova-logo.jpg"
            alt="SOVA"
            width={28}
            height={28}
            className="rounded-sm opacity-90"
          />
          <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-block h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-success">ONLINE</span>
          </span>
          <span aria-hidden>│</span>
          <span>sova_yt_parser.sh</span>
          <span aria-hidden className="hidden sm:inline">│</span>
          <span className="hidden sm:inline">v0.4.2-beta</span>
        </div>
        <ModeToggle 
          mode={mode} 
          theme={theme}
          onModeChange={onModeChange}
          onThemeChange={onThemeChange}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-20">
        {/* Path crumb */}
        <div
          className={
            isHardcore
              ? "font-mono text-xs text-muted-foreground"
              : "font-sans text-xs uppercase tracking-widest text-muted-foreground"
          }
        >
          {isHardcore ? "~/sova/playground/yt_summarizer" : "SOVA Playground / YT Summarizer"}
        </div>

        <h1
          className={
            isHardcore
              ? "mt-3 text-balance font-mono text-3xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl"
              : "mt-3 text-balance font-sans text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
          }
        >
          {isHardcore ? (
            <>
              <span className="text-muted-foreground">{"// "}</span>
              <span className="text-foreground">{titleText}</span>
              <span className={`ml-1 inline-block h-[0.9em] w-[0.55ch] translate-y-[2px] bg-primary align-middle ${isCursorVisible ? 'cursor-blink' : 'opacity-0'}`} />
            </>
          ) : (
            <>
              YouTube{" "}
              <span className="text-primary">Summarizer</span>
            </>
          )}
        </h1>

        <p
          className={
            isHardcore
              ? "mt-5 max-w-2xl text-pretty font-mono text-sm leading-relaxed text-muted-foreground sm:text-base"
              : "mt-5 max-w-2xl text-pretty font-sans text-base leading-relaxed text-muted-foreground sm:text-lg"
          }
        >
          {isHardcore ? (
            <>
              <span className="text-success">$</span> Извлечение смыслов. Обход воды. Генерация
              саммари за миллисекунды.
            </>
          ) : (
            <>Вставьте ссылку на YouTube — получите чистую выжимку без воды за секунды.</>
          )}
        </p>

        {/* meta tags */}
        <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px]">
          {[
            { k: "MODULE", v: "yt_summarizer" },
            { k: "LANG", v: "ru / en" },
            { k: "ENGINE", v: "gemini-2.5-flash" },
            { k: "AVG_TIME", v: "~2.4s" },
          ].map((t) => (
            <span
              key={t.k}
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-1 text-muted-foreground"
            >
              <span className="text-primary">{t.k}</span>
              <span aria-hidden>=</span>
              <span className="text-foreground">{t.v}</span>
            </span>
          ))}
        </div>
      </div>

      {/* subtle grid background */}
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40" />
    </header>
  )
}
