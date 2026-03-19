# Cafe 307 (私人晩ごはん)

Private dining experience app for Cafe 307, an intimate dinner party series on Sawtelle. Guests enter a reservation code to browse weekly menus, read chef's notes, and request dishes via $1 Stripe payments.

## Features

**Authentication**
- Code-based login using reservation codes (no accounts or passwords)
- Role-based permissions: `vivian` (chef) can manage menus and notes; `vlad` (reviewer) can write tasting reviews

**Menu**
- Weekly dinner menu with courses grouped by category (appetizer, main, dessert)
- Bilingual dish names (Chinese / English)
- Archive of all past menus, sorted by date

**Notes**
- Next reservation card pinned at the top
- Collapsible accordion per menu date (latest expanded by default)
- Chef's notes and guest tasting reviews per dinner date

**Dish Requests**
- Pay $1 via Stripe to request a dish; most-requested dishes rise to the top
- Inline payment form with three methods: Card, Link, and Apple Pay / Google Pay
- Email receipts via Stripe when an email address is provided
- Star toggle for vivian/vlad to mark wishes as granted

**Menu Management**
- Add and edit menus (vivian only) via a dedicated tab

**Atmosphere**
- Background music (Ragnarok Online soundtracks) with a sound toggle on the login page and in the header
- Staggered fade-in animations throughout the UI
- Pastel pink and lavender color palette with serif typography

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Stripe Elements |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Payments | Stripe (PaymentIntent flow with Card, Link, and Payment Request API) |
| Styling | Inline styles with shared theme tokens (colors, fonts, spacing) |
| Deployment | Render (Docker), 1 GB persistent disk for SQLite |

## Project Structure

```
cafe307/
  src/                React entry point, root component, API helpers, music context
  components/
    auth/             LoginPage (reservation code input)
    layout/           MainViewHeader, TabBar, FadeIn, SectionDivider
    menu/             DinnerMenu, ArchiveTab, AddMenuTab
    notes/            NotesTab, DinnerDateNotes, NextReservationCard
    RequestsTab.jsx   Dish request form + Stripe payment + wishes list
  data/
    config/           Theme tokens, tab definitions, roles, login config
    fallback/         Offline menu/note data (used when API is unreachable)
  backend/
    app.py            FastAPI app, CORS, SPA serving
    routes/           menus.py, notes.py, requests.py
    models.py         SQLAlchemy models
    database.py       Engine and session setup
    seed.py           Idempotent seed script for initial data
  public/music/       Background music tracks (mp3)
  Dockerfile          Multi-stage build (Node frontend + Python backend)
  render.yaml         Render deployment config
  vite.config.js      Vite configuration
```

## Quick Start

**Backend:**

```bash
pip install -r backend/requirements.txt
python -m backend.seed            # seed initial data (idempotent)
uvicorn backend.app:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**

```bash
npm install
npm run dev                       # Vite dev server on :5173
```

Create a `.env.local` in the repo root for local development:

```
VITE_API_BASE=http://127.0.0.1:8001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_BASE` | Frontend (build-time) | Backend URL; empty string in production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend (build-time) | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Backend | Stripe secret key for creating and verifying PaymentIntents |
| `STRIPE_WEBHOOK_SECRET` | Backend | Stripe webhook signing secret |
| `DATA_DIR` | Backend | Directory for `cafe307.db` (default `.`) |
| `PRODUCTION_URL` | Backend | Added to CORS allowed origins |

## Deployment

Hosted on Render via `render.yaml`. The Docker build is multi-stage: Node builds the Vite frontend, then the Python image serves both the API and the static SPA bundle.

```bash
docker build --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_... -t cafe307 .
docker run -p 10000:10000 -e STRIPE_SECRET_KEY=sk_... cafe307
```

SQLite is persisted on a 1 GB Render disk mounted at `/data`. The `DATA_DIR` env var points the backend to that mount so the database survives redeploys.
