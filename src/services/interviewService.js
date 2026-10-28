/**
 * Interview service — create, list, get session, submit answer, abandon session.
 */

import { apiFetch } from "./api";
import { API_ENDPOINTS } from "@/configs/api";

/**
 * Start a new calibrated interview session.
 * @param {{ resume_uuid: string, role: string, target_company?: string, difficulty: 'easy'|'medium'|'hard' }} data
 * @returns {Promise<import("./types").InterviewTurnResponse>}
 */
export async function startInterview(data) {
  return apiFetch(API_ENDPOINTS.INTERVIEWS.LIST_CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * List the current user's mock interviews.
 * @param {{ limit?: number, offset?: number }} params
 * @returns {Promise<import("./types").InterviewRead[]>}
 */
export async function listInterviews(params = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set("limit", params.limit);
  if (params.offset != null) query.set("offset", params.offset);

  const qs = query.toString();
  return apiFetch(`${API_ENDPOINTS.INTERVIEWS.LIST_CREATE}${qs ? `?${qs}` : ""}`);
}

/**
 * Get interview session details and historical turns.
 * @param {string} uuid
 * @returns {Promise<import("./types").InterviewRead>}
 */
export async function getInterview(uuid) {
  return apiFetch(API_ENDPOINTS.INTERVIEWS.DETAIL(uuid));
}

/**
 * Submit answer for the active turn.
 * IMPORTANT: `seq` must exactly match the server's expected turn sequence number.
 *
 * @param {string} uuid - interview session uuid
 * @param {{ seq: number, answer: string }} data
 * @returns {Promise<import("./types").InterviewTurnResponse>}
 */
export async function submitAnswer(uuid, data) {
  return apiFetch(API_ENDPOINTS.INTERVIEWS.ANSWER(uuid), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Abandon active interview session.
 * @param {string} uuid
 * @returns {Promise<import("./types").InterviewTurnResponse>}
 */
export async function abandonInterview(uuid) {
  return apiFetch(API_ENDPOINTS.INTERVIEWS.ABANDON(uuid), {
    method: "POST",
  });
}

