"""
Vercel ASGI entry point.
Vercel needs an `app` export at module level to serve the ASGI application.
This file re-exports the FastAPI app from main.py.
"""
from main import app  # noqa: F401