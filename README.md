# Cafe 307 (私人晚宴)

Private dining experience web app for an intimate dinner party series. Guests enter a reservation code to browse dinner menus, read chef's notes, leave VIP reviews, and vote on dish requests.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 5, Stripe Elements |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Payments | Stripe (PaymentIntent flow, email receipts) |
| Deployment | Render (Docker), persistent disk for SQLite |

## Features

- Bilingual dinner menus (Chinese / English) with course categories
- Chef's notes and VIP guest reviews per menu date
- Dish request voting -- pay $1 via Stripe (Card, Link, or Apple Pay) to request a dish
- Background music per screen (Ragnarok Online OST)
- Role-based access: `vivian` (chef) can edit menus and notes, `vlad` (VIP) can write reviews
- Offline fallback data when the API is unreachable

## Quick start

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

Create a `.env.local` in the repo root for local dev:

```
VITE_API_BASE=http://127.0.0.1:8001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_BASE` | Frontend | Backend URL (empty string in production) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend (build-time) | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Backend | Stripe secret key for PaymentIntents |
| `DATA_DIR` | Backend | Directory for `cafe307.db` (default `.`) |
| `PRODUCTION_URL` | Backend | Added to CORS allowed origins |

## Deployment

- **Render:** configured via `render.yaml` -- Docker web service with a 1 GB persistent disk at `/data`
- **Docker:** multi-stage build (`Dockerfile`) -- Node builds the frontend, Python serves everything

```bash
docker build --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_... -t cafe307 .
docker run -p 10000:10000 -e STRIPE_SECRET_KEY=sk_... cafe307
```

## Project structure

```
cafe307/
  src/              React entry point, root component, config, music context
  components/       UI components (auth, layout, menu, notes, requests)
  data/
    config/         Design tokens, tabs, roles, animation constants
    fallback/       Offline menu/note data (API fallback)
  backend/          FastAPI app, routes, models, seed script
  public/music/     Background music tracks (mp3)
  render.yaml       Render deployment config
  Dockerfile        Multi-stage Docker build
  vite.config.js    Vite configuration
```
