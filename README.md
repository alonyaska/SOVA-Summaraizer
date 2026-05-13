# <p align="center">🦉 SOVA YT_SUMMARIZER</p>

<p align="center">
  <img src="https://cdn.leonardo.ai/users/3dbee0af-1e14-473e-8b7f-95118cbc7141/generations/1f14471f-48ef-69c0-a8cc-c2bf302fc751/gemini-2.5-flash-image_A_minimalist_logo_for_a_secure_AI_messenger_called_Sova_owl_._No_text_icon_only.-0.jpg" alt="SOVA Banner" width="420">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-0.100+-05998b?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Google_Gemma-4_26B-4285F4?style=for-the-badge&logo=google" alt="Gemma">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel">
</p>

---

## 🌟 Обзор
**SOVA YT_SUMMARIZER** — это интеллектуальный сервис для мгновенного анализа и суммаризации YouTube-видео. Используя мощь **Gemma 4 26B** и **Supadata**, приложение извлекает суть из любого видео, экономя часы вашего времени.

Данный проект является частью экосистемы **SOVA-PLAYGROUND** — набора инструментов для экспериментов с AI и современными веб-технологиями.

## ✨ Особенности
- **Терминальный интерфейс**: Уникальный хакерский стиль в духе ретро-футуризма.
- **Deep AI Analysis**: Не просто краткий пересказ, а выделение ключевых тезисов с таймкодами.
- **Real-time Logging**: Визуализация процесса обработки в реальном времени через интерактивный терминал.
- **Hybrid Stack**: Бесшовная интеграция Next.js фронтенда и FastAPI бэкенда.
- **Vercel Optimized**: Полностью готов к деплою в serverless окружение.

## 🛠 Технологический стек
- **Frontend**: React 19, Next.js 16 (App Router), Tailwind CSS v4, Shadcn/UI.
- **Backend**: Python 3.12, FastAPI, Pydantic v2.
- **AI/API**: Google Gemma 4 26B SDK, Supadata (Transcript extraction).

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/alonyaska/SOVA-Summaraizer.git
cd SOVA-Summaraizer
```

### 2. Настройка Backend (Python)
```bash
cd api
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Настройка Frontend (Node.js)
```bash
cd ..
npm install # или pnpm install
```

### 4. Переменные окружения
Создайте файл `.env` в папке `api/`:
```env
SUPADATA_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

## 👨‍💻 Разработчик
Создано с любовью к коду и технологиям:
**[@alonyaska](https://github.com/alonyaska)**

---

<p align="center">
  <i>Part of the <b>SOVA-PLAYGROUND</b> ecosystem.</i>
</p>
