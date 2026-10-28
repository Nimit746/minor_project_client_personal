/**
 * Resume service — upload, list, get, delete.
 */

import { apiFetch } from "./api";
import { API_ENDPOINTS } from "@/configs/api";

/**
 * Upload a resume file. Returns 202 — poll getResume() until status is 'ready'.
 * @param {File} file - PDF or DOCX file
 * @returns {Promise<import("./types").ResumeRead>}
 */
export async function uploadResume(file) {
  const form = new FormData();
  form.append("file", file);

  return apiFetch(API_ENDPOINTS.RESUMES.LIST_CREATE, {
    method: "POST",
    body: form,
    // headers intentionally omitted — lets browser set multipart boundary
    headers: {},
  });
}

/**
 * List the current user's resumes.
 * @param {{ skip?: number, limit?: number }} [params]
 * @returns {Promise<import("./types").ResumeRead[]>}
 */
export async function listResumes(params = {}) {
  const query = new URLSearchParams();
  if (params.skip != null) query.set("skip", String(params.skip));
  if (params.limit != null) query.set("limit", String(params.limit));

  const qs = query.toString();
  return apiFetch(`${API_ENDPOINTS.RESUMES.LIST_CREATE}${qs ? `?${qs}` : ""}`);
}

/**
 * Get a single resume by UUID. Use for polling processing status.
 * @param {string} uuid
 * @returns {Promise<import("./types").ResumeRead>}
 */
export async function getResume(uuid) {
  return apiFetch(API_ENDPOINTS.RESUMES.DETAIL(uuid));
}

/**
 * Delete a resume.
 * @param {string} uuid
 * @returns {Promise<null>}
 */
export async function deleteResume(uuid) {
  return apiFetch(API_ENDPOINTS.RESUMES.DETAIL(uuid), { method: "DELETE" });
}

