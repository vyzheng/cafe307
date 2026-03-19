"""Cafe 307 API: menus, reviews, notes. Serves Vite frontend in production."""
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.database import engine, Base
from backend.routes.menus import router as menus_router
from backend.routes.notes import router as notes_router
from backend.routes.requests import router as requests_router

# In production, the Vite build output lives in dist/ at the repo root.
# app.py serves it as a SPA fallback so the entire app is one deployment.
DIST_DIR = Path(__file__).resolve().parent.parent / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup hook: create tables and run lightweight migrations.

    SQLAlchemy's create_all only creates missing *tables* -- it never
    alters existing ones. So when we add a new column (like granted_at)
    to a model, we need an explicit ALTER TABLE. The try/except pattern
    is safe because the ALTER fails silently if the column already exists.
    """
    Base.metadata.create_all(bind=engine)

    # Auto-migration: add granted_at to dish_requests for the star toggle feature.
    # This runs on every startup but is a no-op after the first successful ALTER.
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE dish_requests ADD COLUMN granted_at DATETIME"))
            conn.commit()
        except Exception:
            pass  # column already exists -- expected on subsequent startups
    yield


app = FastAPI(title="Cafe 307 API", lifespan=lifespan)

# CORS: allow the Vite dev server locally, plus the production domain if set.
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
PRODUCTION_URL = os.environ.get("PRODUCTION_URL")
if PRODUCTION_URL:
    allowed_origins.append(PRODUCTION_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(menus_router)
app.include_router(notes_router)
app.include_router(requests_router)

if DIST_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")
    app.mount("/music", StaticFiles(directory=str(DIST_DIR / "music")), name="music")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the Vite SPA; any non-API path returns index.html."""
        file = DIST_DIR / full_path
        if file.is_file():
            return FileResponse(str(file))
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Cafe 307 API (no frontend build found)"}
