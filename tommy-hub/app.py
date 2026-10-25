"""Vercel entrypoint for the Tommy Hub FastAPI application."""

from backend.app.main import app

__all__ = ["app"]
