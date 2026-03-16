# Backend

FastAPI application serving the Cafe 307 API and (in production) the Vite-built frontend.

## Structure

```
backend/
  app.py             ← FastAPI app: CORS, routers, static file serving, SPA fallback
  database.py        ← SQLAlchemy engine, session factory, Base (DATA_DIR env var)
  models.py          ← ORM models: Menu, ChefNote, VipReview
  seed.py            ← Seeds default menu, chef note, and VIP review if missing
  auth.py            ← Shared auth dependencies (require_vivian, require_vlad)
  requirements.txt   ← Python dependencies
  routes/
    menus.py         ← CRUD for menus (GET current, GET archive, PUT current, PATCH, POST archive)
    notes.py         ← CRUD for chef notes and VIP reviews (GET, PUT upsert, DELETE)
```

## Running locally

```bash
# From repo root:
uvicorn backend.app:app --host 0.0.0.0 --port 8001 --reload

# Seed initial data (idempotent):
python -m backend.seed
```

## API endpoints

### Menus (`/api/menus`)

| Method | Path               | Auth     | Description                    |
|--------|--------------------|----------|--------------------------------|
| GET    | `/current`         | public   | Current/featured menu          |
| GET    | `/archive`         | public   | All past menus, newest first   |
| PUT    | `/current`         | vivian   | Replace current menu (archives old) |
| PATCH  | `/{menu_id}`       | vivian   | Update a menu by ID            |
| POST   | `/archive`         | vivian   | Add a menu directly to archive |

### Notes (`/api/notes`)

| Method | Path               | Auth     | Description                    |
|--------|--------------------|----------|--------------------------------|
| GET    | `/chef?menuDate=…` | public   | Chef note for a date           |
| PUT    | `/chef`            | vivian   | Upsert chef note               |
| DELETE | `/chef`            | vivian   | Delete chef note               |
| GET    | `/vip-review?menuDate=…` | public | VIP review for a date      |
| PUT    | `/vip-review`      | vlad     | Upsert VIP review              |
| DELETE | `/vip-review`      | vlad     | Delete VIP review              |

## Authentication

Auth uses the `X-Reservation-Code` header. Roles:
- **vivian** — can edit menus and chef notes
- **vlad** — can edit VIP reviews
- Public endpoints (GET) require no header

## Database

SQLite via SQLAlchemy. The DB file path is `{DATA_DIR}/cafe307.db` where `DATA_DIR` defaults to `.` (repo root). On Render, `DATA_DIR=/data` points to the persistent disk.

## Production

In production, `app.py` mounts the Vite `dist/` directory:
- `/assets/*` and `/music/*` as static files
- All other non-API paths serve `index.html` (SPA fallback)
