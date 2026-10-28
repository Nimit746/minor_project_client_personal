/**
 * Authentication service.
 *
 * Note: Login uses x-www-form-urlencoded (FastAPI OAuth2PasswordRequestForm),
 *       NOT JSON. This is the single most common mistake with this API.
 */

import { apiFetch, setTokens } from "./api";
import { API_BASE_URL, API_ENDPOINTS } from "@/configs/api";

/**
 * Register a new user account.
 * @param {{ email: string, full_name: string, password: string }} data
 * @returns {Promise<import("./types").UserRead>}
 */
export async function register(data) {
  return apiFetch(API_ENDPOINTS.AUTH.REGISTER, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Login with email + password.
 * IMPORTANT: This endpoint expects `application/x-www-form-urlencoded`
 *            with `username` (not `email`) and `password` fields.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("./types").TokenPair>}
 */
export async function login(email, password) {
  const body = new URLSearchParams({
    username: email,
    password: password,
  });

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: "POST",
    body, // URLSearchParams auto-sets Content-Type to x-www-form-urlencoded
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    err._status = res.status;
    throw err;
  }

  const tokenPair = await res.json();
  setTokens(tokenPair.access_token, tokenPair.refresh_token);
  return tokenPair;
}
