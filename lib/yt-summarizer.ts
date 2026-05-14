export type Theme = "blue" | "youtube"
export type Mode = "hardcore" | "casual"

export type SummaryBullet = {
  timecode: string
  title: string
  description: string
}

export type Mentions = {
  tools: string[]
  people: string[]
  resources: string[]
}

export type SummaryResult = {
  videoId: string
  url: string
  title: string
  category: string
  tone: string
  targetAudience: string
  durationRead: string
  mainIdea: string
  keyPoints: SummaryBullet[]
  actionItems: string[]
  notableQuotes: string[]
  mentions: Mentions
  tags: string[]
  cached?: boolean
}

export type LogLine = {
  time: string
  source: "sys_core" | "sova_ai" | "error" | "info"
  text: string
  status?: "OK" | "ERR" | "WARN"
}

const YT_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/

export function parseYouTubeId(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  const m = trimmed.match(YT_REGEX)
  if (!m) return null
  return m[5] ?? null
}

export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeId(url) !== null
}

function nowStamp(offsetSec = 0): string {
  const d = new Date(Date.now() + offsetSec * 1000)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function buildProcessingLog(_videoId: string): LogLine[] {
  return [
    { time: nowStamp(0), source: "sys_core", text: "Пинг серверов YouTube...", status: "OK" },
    { time: nowStamp(0), source: "sys_core", text: "Извлечение метаданных видео..." },
    { time: nowStamp(0), source: "sys_core", text: "Поиск дорожки субтитров [ru, en]...", status: "OK" },
    { time: nowStamp(1), source: "sys_core", text: "Транскрипт получен. Размер: 18.4KB" },
    { time: nowStamp(1), source: "sova_ai", text: "> Анализирую запрос... очистка от воды." },
    { time: nowStamp(2), source: "sova_ai", text: "> Кластеризация ключевых тезисов..." },
    { time: nowStamp(2), source: "sova_ai", text: "> Компилирую саммари. Модель: Gemini 2.5 Flash" },
    { time: nowStamp(3), source: "sys_core", text: "Готово. Time-to-summary: 2.41s", status: "OK" },
  ]
}

// Deterministic mock summaries — pick by videoId hash so the same link gives the same result.
const MOCK_LIBRARY: Omit<SummaryResult, "videoId" | "url">[] = [
  {
    title: "Архитектура трансформеров: почему внимание — это всё",
    category: "Лекция",
    tone: "академичный",
    targetAudience: "ML-инженеры и студенты технических вузов.",
    durationRead: "1:48",
    mainIdea: "Механизм self-attention заменил рекуррентные сети, потому что распараллеливается и улавливает дальние зависимости в тексте лучше LSTM.",
    keyPoints: [
      { timecode: "00:42", title: "RNN Constraints", description: "Проблема RNN/LSTM - последовательность блокирует распараллеливание на GPU." },
      { timecode: "03:15", title: "Self-Attention", description: "Self-attention считает релевантность каждого токена ко всем остальным за один проход." },
      { timecode: "09:08", title: "Multi-head Attention", description: "Multi-head attention: разные \"головы\" учат разные типы связей - синтаксис, семантику, кореференции." },
    ],
    action_items: ["Изучить механизм attention", "Прочитать статью Attention Is All You Need"],
    notable_quotes: ["Внимание - это всё, что вам нужно"],
    mentions: { tools: ["PyTorch", "TensorFlow"], people: ["Ashish Vaswani"], resources: ["ArXiv"] },
    tags: ["AI", "ML", "Transformers", "Deep Learning", "NLP"],
    actionItems: [],
    notableQuotes: [],
  },
  {
    title: "Как стартапы умирают: 12 системных ошибок",
    category: "Бизнес-разбор",
    tone: "аналитический",
    targetAudience: "Фаундеры и продукт-менеджеры.",
    durationRead: "2:10",
    mainIdea: "Большинство стартапов умирают не от конкурентов, а от потери фокуса, преждевременного масштабирования и игнорирования юнит-экономики.",
    keyPoints: [
      { timecode: "01:20", title: "Building in Vacum", description: "Главный убийца - building в вакууме без customer development." },
      { timecode: "08:44", title: "Premature Scaling", description: "Преждевременный hire: 20 инженеров до product-market fit сжигают раннер за квартал." },
    ],
    actionItems: ["Сделать CustDev", "Проверить юнит-экономику"],
    notableQuotes: ["Стартапы умирают не от голода, а от несварения"],
    mentions: { tools: [], people: ["Paul Graham"], resources: ["The Lean Startup"] },
    tags: ["Startup", "Business", "Product Management", "VC", "Growth"],
  },
]

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function generateMockSummary(url: string): SummaryResult {
  const id = parseYouTubeId(url) ?? "unknown"
  const idx = hashStr(id) % MOCK_LIBRARY.length
  const base = MOCK_LIBRARY[idx]
  const cached = hashStr(id) % 3 === 0
  return {
    videoId: id,
    url,
    cached,
    ...base,
  }
}

export function formatLogLine(line: LogLine): string {
  const tag = line.source === "sova_ai" ? "sova_ai" : line.source === "error" ? "ERROR" : line.source
  const status = line.status ? ` [${line.status}]` : ""
  return `[${line.time}] ${tag}: ${line.text}${status}`
}

// Typo effect: chance to introduce random typo, then fix it with backspace effect
export function generateTypoEffect(text: string, typoChance: number = 0.05) {
  if (Math.random() > typoChance) {
    return { hasTypo: false, steps: [] }
  }

  const errorIdx = Math.floor(Math.random() * text.length)
  const errorChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Random letter
  const typoText = text.slice(0, errorIdx) + errorChar + text.slice(errorIdx)

  const steps: string[] = []
  // Type out with typo
  for (let i = 0; i <= typoText.length; i++) {
    steps.push(typoText.slice(0, i))
  }
  // Backspace and retype correct part
  const deleteSteps = typoText.length - errorIdx
  for (let i = 0; i < deleteSteps; i++) {
    steps.push(typoText.slice(0, typoText.length - i - 1))
  }
  // Retype correct ending
  for (let i = errorIdx; i < text.length; i++) {
    steps.push(text.slice(0, i + 1))
  }

  return { hasTypo: true, steps }
}

export function timecodeToSeconds(timecode: string): number {
  const parts = timecode.split(":").map(Number)
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  return 0
}
