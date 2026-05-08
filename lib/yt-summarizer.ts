export type Theme = "blue" | "youtube"
export type Mode = "hardcore" | "casual"

export type SummaryBullet = {
  timecode: string
  text: string
}

export type SummaryResult = {
  videoId: string
  url: string
  title: string
  channel: string
  durationOriginal: string
  durationRead: string
  thumbnail?: string
  tldr: string
  bullets: SummaryBullet[]
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
    { time: nowStamp(1), source: "sova_ai", text: "> Анализирую запрос... Очистка от воды." },
    { time: nowStamp(2), source: "sova_ai", text: "> Кластеризация ключевых тезисов..." },
    { time: nowStamp(2), source: "sova_ai", text: "> Компилирую саммари. Модель: gpt-4o-mini" },
    { time: nowStamp(3), source: "sys_core", text: "Готово. Time-to-summary: 2.41s", status: "OK" },
  ]
}

// Deterministic mock summaries — pick by videoId hash so the same link gives the same result.
const MOCK_LIBRARY: Omit<SummaryResult, "videoId" | "url">[] = [
  {
    title: "Архитектура трансформеров: почему внимание — это всё",
    channel: "DeepLearning RU",
    durationOriginal: "47:12",
    durationRead: "1:48",
    tldr: "Механизм self-attention заменил рекуррентные сети, потому что распараллеливается и улавливает дальние зависимости в тексте лучше LSTM.",
    bullets: [
      { timecode: "00:42", text: "Проблема RNN/LSTM — последовательность блокирует распараллеливание на GPU." },
      { timecode: "03:15", text: "Self-attention считает релевантность каждого токена ко всем остальным за один проход." },
      { timecode: "09:08", text: "Multi-head attention: разные «головы» учат разные типы связей — синтаксис, семантику, кореференции." },
      { timecode: "17:33", text: "Positional encoding нужен, потому что attention сам по себе не знает порядка слов." },
      { timecode: "26:51", text: "Decoder-only архитектура (GPT) — это просто стек causal-attention блоков с next-token prediction." },
      { timecode: "38:20", text: "Scaling laws: качество растёт предсказуемо с параметрами, данными и compute." },
    ],
  },
  {
    title: "Как стартапы умирают: 12 системных ошибок",
    channel: "Product Mindset",
    durationOriginal: "1:02:48",
    durationRead: "2:10",
    tldr: "Большинство стартапов умирают не от конкурентов, а от потери фокуса, преждевременного масштабирования и игнорирования юнит-экономики.",
    bullets: [
      { timecode: "01:20", text: "Главный убийца — building в вакууме без customer development." },
      { timecode: "08:44", text: "Преждевременный hire: 20 инженеров до product-market fit сжигают раннер за квартал." },
      { timecode: "15:09", text: "Юнит-экономика должна работать на бумаге ДО первого платного канала." },
      { timecode: "24:30", text: "Pivot — это не провал, это сигнал что команда умеет читать данные." },
      { timecode: "37:55", text: "Co-founder conflict — причина смерти #2 после отсутствия рынка." },
      { timecode: "51:12", text: "Растёт MRR ≠ растёт бизнес. Смотри на retention и payback period." },
    ],
  },
  {
    title: "Rust для Go-разработчиков: что реально отличается",
    channel: "systems.dev",
    durationOriginal: "32:05",
    durationRead: "1:25",
    tldr: "Rust даёт безопасность памяти без GC через ownership, но требует радикального пересмотра привычек проектирования по сравнению с Go.",
    bullets: [
      { timecode: "00:55", text: "Ownership и borrow checker — это не синтаксис, это новая ментальная модель." },
      { timecode: "06:22", text: "Lifetimes явные там, где в Go компилятор просто выделяет на куче." },
      { timecode: "12:40", text: "Result<T, E> + ? оператор приятнее, чем `if err != nil` в Go." },
      { timecode: "19:08", text: "async в Rust — zero-cost, но требует runtime (tokio); в Go — встроен в язык." },
      { timecode: "25:17", text: "Trait’ы мощнее интерфейсов Go, но кривая обучения круче." },
    ],
  },
  {
    title: "Минимализм в дизайне интерфейсов: миф или метод",
    channel: "UI/UX Lab",
    durationOriginal: "21:34",
    durationRead: "1:05",
    tldr: "Минимализм — это не «убрать всё», а убрать то, что не работает на цель пользователя на конкретном экране.",
    bullets: [
      { timecode: "01:10", text: "Whitespace — активный элемент композиции, а не пустота." },
      { timecode: "05:48", text: "Hick’s Law: каждый лишний пункт меню удлиняет принятие решения." },
      { timecode: "11:22", text: "Контраст и иерархия важнее количества акцентных цветов." },
      { timecode: "16:40", text: "Иконка без подписи — почти всегда хуже, чем подпись без иконки." },
    ],
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
