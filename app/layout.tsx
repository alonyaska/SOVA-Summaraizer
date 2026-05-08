import type { Metadata, Viewport } from "next"
import { JetBrains_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "<SOVA> // YT_SUMMARIZER",
  description:
    "Извлечение смыслов. Обход воды. Генерация саммари за миллисекунды. Микросервис экосистемы SOVA Playground.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#0C0C0E",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={`${jetbrainsMono.variable} ${inter.variable} bg-background`} suppressHydrationWarning>
      <body className="font-mono antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
