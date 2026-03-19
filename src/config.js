/**
 * API base URL for the backend. Set VITE_API_BASE in .env or .env.local (e.g. http://127.0.0.1:8001).
 * Default port 8001 to avoid conflict with other apps on 8000.
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";
/* Stripe publishable key for the RequestsTab inline payment form.
   Without this key, the Stripe Elements form will not render and dish
   requests are effectively disabled. */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
