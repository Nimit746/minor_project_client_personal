/**
 * User service — profile fetch and update.
 */

import { apiFetch } from "./api";
import { API_ENDPOINTS } from "@/configs/api";

/**
 * Get the currently authenticated user's profile.
 * @returns {Promise<import("./types").UserRead>}
 */
export async function getMe() {
  return apiFetch(API_ENDPOINTS.USERS.ME);
}

/**
 * Update the current user's profile.
 * Currently only `full_name` is updatable per API spec.
 * @param {{ full_name?: string }} data
 * @returns {Promise<import("./types").UserRead>}
 */
export async function updateMe(data) {
  return apiFetch(API_ENDPOINTS.USERS.ME, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

