# Backend

FastAPI application serving the Cafe 307 REST API. In production it also serves the Vite-built frontend as a SPA.

## Structure

```
backend/
  app.py           FastAPI app: CORS, routers, SPA fallback
  database.py      SQLAlchemy engine + session (SQLite)
  models.py        ORM models
  schemas.py       Pydantic request/response schemas
  auth.py          Role-based auth dependencies
  seed.py          Idempotent DB seeder
  requirements.txt Python deps
  routes/
    menus.py       Menu CRUD
    notes.py       Chef notes + VIP reviews
    requests.py    Dish requests + Stripe payments
```

## API routes

### Menus (`/api/menus`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/current` | public | Current/featured menu |
| GET | `/archive` | public | All past menus (newest first) |
| PUT | `/current` | vivian | Replace current menu (archives old) |
| PATCH | `/{menu_id}` | vivian | Update a menu by ID |
| POST | `/archive` | vivian | Add a menu to the archive |

### Notes (`/api/notes`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/chef?menuDate=...` | public | Chef note for a date |
| PUT | `/chef` | vivian | Upsert chef note |
| DELETE | `/chef` | vivian | Delete chef note |
| GET | `/vip-review?menuDate=...` | public | VIP review for a date |
| PUT | `/vip-review` | vlad | Upsert VIP review |
| DELETE | `/vip-review` | vlad | Delete VIP review |

### Requests (`/api/requests`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | public | All dish requests ranked by count |
| POST | `/create-payment-intent` | logged-in | Create Stripe PaymentIntent ($1) |
| POST | `/confirm` | logged-in | Record request after payment + send receipt |

## Authentication

Uses the `X-Reservation-Code` header. Role checks are defined in `auth.py`:

- **vivian** -- chef; can edit menus and chef notes
- **vlad** -- VIP; can edit reviews
- **Any valid code** -- can submit dish requests (vivian, vlad, mushu, gelato, caramel, tangyuan)
- **Public** -- GET endpoints require no header

## Database

SQLite via SQLAlchemy. DB path: `{DATA_DIR}/cafe307.db` (defaults to `./cafe307.db`).

| Model | Table | Purpose |
|-------|-------|---------|
| `Menu` | `menus` | Dinner menus with courses (JSON column) |
| `ChefNote` | `chef_notes` | Chef's notes per menu date |
| `VipReview` | `vip_reviews` | VIP guest reviews per menu date |
| `DishRequest` | `dish_requests` | Paid dish requests with Stripe payment ID |

## Stripe integration

The dish request flow uses Stripe PaymentIntents:

1. Frontend calls `POST /api/requests/create-payment-intent` with a dish name
2. Backend creates a $1 PaymentIntent and returns `clientSecret`
3. Frontend confirms payment via Stripe Elements (Card, Link, or Apple Pay)
4. Frontend calls `POST /api/requests/confirm` with the `paymentIntentId`
5. Backend verifies the payment succeeded, records the request, and optionally sends an email receipt via Stripe

Requires `STRIPE_SECRET_KEY` environment variable.

## Running locally

```bash
# From repo root
pip install -r backend/requirements.txt
python -m backend.seed                                    # seed data
uvicorn backend.app:app --host 0.0.0.0 --port 8001 --reload
```

## Production

In production, `app.py` mounts `dist/` and serves:
- `/assets/*` and `/music/*` as static files
- All other non-API paths return `index.html` (SPA fallback)
