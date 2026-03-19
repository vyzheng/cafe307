/**
 * Shared fetch wrapper for API calls. Handles JSON parsing, error extraction,
 * and the X-Reservation-Code auth header.
 *
 * Every API call in the app goes through one of these two functions so error
 * handling is consistent: callers always get a thrown Error with a human-readable
 * message, never a raw Response they have to parse themselves.
 */
import { API_BASE } from "./config";

/**
 * apiFetch — centralized fetch that adds Content-Type: application/json and
 * extracts FastAPI's `detail` field from error responses.
 *
 * Why detail can be a string OR an array:
 *   - For manually raised HTTPException, FastAPI sets detail to a string
 *     (e.g. "Menu not found").
 *   - For Pydantic validation errors (422), FastAPI sets detail to an array
 *     of objects like [{ loc: ["body","date"], msg: "field required", ... }].
 *   We handle both cases so the caller always gets a single string message.
 */
export async function apiFetch(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...optHeaders },
  });
  if (!res.ok) {
    /* Try to parse JSON body; if the response isn't JSON, fall back to {} */
    const body = await res.json().catch(() => ({}));
    const detail = body.detail;
    const msg = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map(e => e.msg || JSON.stringify(e)).join("; ")
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

/**
 * apiAuthFetch — convenience wrapper that adds the X-Reservation-Code header.
 * The backend uses this header for role-based auth: it checks the code against
 * known roles (e.g. "vivian" = chef, "vlad" = reviewer) to decide whether the
 * caller is allowed to perform the requested action.
 */
export async function apiAuthFetch(path, method, body, reservationCode) {
  return apiFetch(path, {
    method,
    headers: { "X-Reservation-Code": reservationCode ?? "" },
    body: JSON.stringify(body),
  });
}
