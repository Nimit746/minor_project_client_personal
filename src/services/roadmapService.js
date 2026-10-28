/**
 * Roadmap service — generate and get roadmaps.
 */

import { apiFetch } from "./api";
import { API_ENDPOINTS } from "@/configs/api";

/**
 * Generate a personalized study roadmap from a completed interview session.
 * @param {string} sessionUuid
 * @returns {Promise<import("./types").RoadmapRead>}
 */
export async function createRoadmap(sessionUuid) {
  return apiFetch(API_ENDPOINTS.ROADMAPS.LIST_CREATE, {
    method: "POST",
    body: JSON.stringify({ session_uuid: sessionUuid }),
  });
}

/**
 * List the current user's generated roadmaps.
 * @param {{ limit?: number, offset?: number }} params
 * @returns {Promise<import("./types").RoadmapRead[]>}
 */
export async function listRoadmaps(params = {}) {
  const query = new URLSearchParams();
  if (params.limit != null) query.set("limit", params.limit);
  if (params.offset != null) query.set("offset", params.offset);

  const qs = query.toString();
  return apiFetch(`${API_ENDPOINTS.ROADMAPS.LIST_CREATE}${qs ? `?${qs}` : ""}`);
}

/**
 * Get roadmap status and content. Poll until status === 'ready' or 'failed'.
 * @param {string} uuid
 * @returns {Promise<import("./types").RoadmapRead>}
 */
export async function getRoadmap(uuid) {
  return apiFetch(API_ENDPOINTS.ROADMAPS.DETAIL(uuid));
}

