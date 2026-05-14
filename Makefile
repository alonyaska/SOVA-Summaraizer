.PHONY: dev dev-frontend dev-backend clean

# Переменные
FASTAPI = api\venv\Scripts\fastapi
API_MAIN = api\main.py

# Запуск всего проекта (открывает два новых окна терминала на Windows)
dev:
	@echo "Запуск фронтенда и бэкенда..."
	start cmd /k "title SOVA Frontend && npm run dev"
	start cmd /k "title SOVA Backend && $(FASTAPI) dev $(API_MAIN)"

# Запуск только фронтенда
dev-frontend:
	npm run dev

# Запуск только бэкенда
dev-backend:
	$(FASTAPI) dev $(API_MAIN)

# Очистка кэша
clean:
	@echo "Очистка кэша .next..."
	if exist .next rmdir /s /q .next
	@echo "Готово."
