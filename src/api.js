/**
 * Shared fetch wrapper for API calls. Handles JSON parsing, error extraction,
 * and the X-Reservation-Code auth header.
 */
import { API_BASE } from "./config";

/**
 * Fetch JSON from the API. Throws on non-ok responses with the server's
 * `detail` message when available.
 */
export async function apiFetch(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...optHeaders },
  });
  if (!res.ok) {
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
 * Fetch JSON with the reservation code auth header.
 */
export async function apiAuthFetch(path, method, body, reservationCode) {
  return apiFetch(path, {
    method,
    headers: { "X-Reservation-Code": reservationCode ?? "" },
    body: JSON.stringify(body),
  });
}
