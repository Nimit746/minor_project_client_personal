/**
 * Base API fetch client with automatic token attachment and refresh logic.
 *
 * Usage:
 *   import { apiFetch } from "@/services/api";
 *   const user = await apiFetch("/api/v1/users/me");
 */

import { API_BASE_URL, API_ENDPOINTS } from "@/configs/api";

// ── Token accessors (localStorage) ──────────────────────────

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ── Token refresh ───────────────────────────────────────────

let refreshPromise = null;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * De-duplicates concurrent refresh attempts.
 * @returns {Promise<boolean>} true if refresh succeeded
 */
async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  // If a refresh is already in-flight, piggyback on it
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core fetch wrapper ──────────────────────────────────────

/**
 * Wraps fetch with:
 * - Automatic Authorization header attachment
 * - Automatic 401 → refresh → replay (once)
 * - JSON parsing / error throwing
 *
 * @param {string} path - API path starting with /api/v1/...
 * @param {RequestInit} options - Standard fetch options
 * @param {boolean} _retry - Internal: prevents infinite refresh loops
 * @returns {Promise<any>} Parsed JSON or null (for 204)
 * @throws {object} The server error body (FastAPI format)
 */
export async function apiFetch(path, options = {}, _retry = true) {
  const token = getAccessToken();

  // Build headers — skip Content-Type for FormData (browser sets multipart boundary)
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // ── Handle 401 with automatic refresh ──
  if (res.status === 401 && _retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch(path, options, false); // replay once with new token
    }
    // Refresh also failed — clear tokens, let caller handle redirect
    clearTokens();
    const err = await res.json().catch(() => ({}));
    err._authExpired = true;
    throw err;
  }

  // ── Handle other errors ──
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    err._status = res.status;
    throw err;
  }

  // ── Success ──
  if (res.status === 204) return null;
  return res.json();
}
