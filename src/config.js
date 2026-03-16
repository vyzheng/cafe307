/**
 * API base URL for the backend. Set VITE_API_BASE in .env or .env.local (e.g. http://127.0.0.1:8001).
 * Default port 8001 to avoid conflict with other apps on 8000.
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? "";
