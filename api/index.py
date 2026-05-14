"""
Vercel ASGI entry point.
Vercel Python runtime looks for `app` in api/index.py by default.
Re-exports the FastAPI application from main.py.
"""
import sys
import os
from pathlib import Path

# Add this directory to sys.path so imports work
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

from main import app  # noqa: E402, F401