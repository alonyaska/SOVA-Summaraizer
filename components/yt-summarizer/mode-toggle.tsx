"use client"

import { Terminal, Sparkles, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mode, Theme } from "@/lib/yt-summarizer"

type Props = {
  mode: Mode
  theme: Theme
  onModeChange: (mode: Mode) => void
  onThemeChange: (theme: Theme) => void
}

export function ModeToggle({ mode, theme, onModeChange, onThemeChange }: Props) {
  return (
    <div className="inline-flex flex-col gap-2 rounded-sm border border-border bg-card p-2 font-mono text-xs">
      {/* Mode Toggle */}
      <div
        role="tablist"
        aria-label="Режим интерфейса"
        className="inline-flex items-center gap-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "hardcore"}
          onClick={() => onModeChange("hardcore")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors",
            mode === "hardcore"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Terminal className="h-3.5 w-3.5" aria-hidden />
          HARDCORE
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "casual"}
          onClick={() => onModeChange("casual")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors",
            mode === "casual"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          CASUAL
        </button>
      </div>

      {/* Theme Toggle */}
      <div
        role="tablist"
        aria-label="Цветовая схема"
        className="inline-flex items-center gap-1 border-t border-border pt-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={theme === "blue"}
          onClick={() => onThemeChange("blue")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors",
            theme === "blue"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div className="h-3 w-3 rounded-full bg-blue-500" aria-hidden />
          BLUE
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={theme === "youtube"}
          onClick={() => onThemeChange("youtube")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 transition-colors",
            theme === "youtube"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Flame className="h-3.5 w-3.5" aria-hidden />
          YOUTUBE
        </button>
      </div>
    </div>
  )
}
