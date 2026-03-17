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

DIST_DIR = Path(__file__).resolve().parent.parent / "dist"


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Cafe 307 API", lifespan=lifespan)

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
