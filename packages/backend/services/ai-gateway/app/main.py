from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as chat_router
from .core.config import get_settings


def create_application() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Mr.Prompt AI Gateway", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    @app.get("/health", tags=["health"])  # pragma: no cover - simple health endpoint
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(chat_router)

    return app


app = create_application()
