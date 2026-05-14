@echo off
start cmd /k "title SOVA Frontend && npm run dev"
start cmd /k "title SOVA Backend && api\venv\Scripts\fastapi dev api\main.py"
