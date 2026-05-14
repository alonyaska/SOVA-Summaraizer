"use client"

import { Terminal, Sparkles, Flame, Check, Monitor, LayoutTemplate } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mode, Theme } from "@/lib/yt-summarizer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  mode: Mode
  theme: Theme
  onModeChange: (mode: Mode) => void
  onThemeChange: (theme: Theme) => void
}

export function ModeToggle({ mode, theme, onModeChange, onThemeChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-sm border border-border bg-card p-1.5 font-mono text-xs">
        {/* Mode Select */}
        <Select value={mode} onValueChange={(v) => onModeChange(v as Mode)}>
          <SelectTrigger className="h-7 w-[130px] border-none bg-transparent shadow-none focus:ring-0 px-2 py-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              <SelectValue placeholder="Mode" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hardcore">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                <span>Hardcore</span>
              </div>
            </SelectItem>
            <SelectItem value="casual">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Casual</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Theme Select */}
        <Select value={theme} onValueChange={(v) => onThemeChange(v as Theme)}>
          <SelectTrigger className="h-7 w-[130px] border-none bg-transparent shadow-none focus:ring-0 px-2 py-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <SelectValue placeholder="Theme" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Blue</span>
              </div>
            </SelectItem>
            <SelectItem value="youtube">
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-red-500" />
                <span>YouTube</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mini Preview Block */}
      <ThemePreview mode={mode} theme={theme} />
    </div>
  )
}

function ThemePreview({ mode, theme }: { mode: Mode; theme: Theme }) {
  // Theme colors based on current selection
  const isBlue = theme === "blue"
  const isHardcore = mode === "hardcore"
  
  return (
    <div 
      className={cn(
        "hidden sm:flex flex-col gap-1 w-12 h-10 rounded-sm border p-1",
        isHardcore ? "border-primary/40 bg-background" : "border-border bg-card",
        !isBlue && "theme-youtube" // Local class if we want to preview without changing global
      )}
      title="Theme Preview"
    >
      <div className="flex gap-1 items-center">
        <div className={cn("h-1.5 w-1.5 rounded-full", isBlue ? "bg-blue-500" : "bg-red-500")} />
        <div className="h-1 flex-1 rounded-sm bg-muted" />
      </div>
      <div className={cn("h-2 w-full rounded-sm mt-0.5", isHardcore ? (isBlue ? "bg-blue-500/20" : "bg-red-500/20") : "bg-muted-foreground/20")} />
      <div className="flex gap-1 mt-auto">
        <div className="h-1 flex-1 rounded-sm bg-muted" />
        <div className="h-1 flex-1 rounded-sm bg-muted" />
      </div>
    </div>
  )
}
