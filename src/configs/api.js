/**
 * Centralized API configuration.
 * Contains base URL and all endpoint paths.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    REFRESH: "/api/v1/auth/refresh",
  },
  USERS: {
    ME: "/api/v1/users/me",
  },
  RESUMES: {
    LIST_CREATE: "/api/v1/resumes",
    DETAIL: (uuid) => `/api/v1/resumes/${uuid}`,
  },
  INTERVIEWS: {
    LIST_CREATE: "/api/v1/interviews",
    DETAIL: (uuid) => `/api/v1/interviews/${uuid}`,
    ANSWER: (uuid) => `/api/v1/interviews/${uuid}/answer`,
    ABANDON: (uuid) => `/api/v1/interviews/${uuid}/abandon`,
  },
  ROADMAPS: {
    LIST_CREATE: "/api/v1/roadmaps",
    DETAIL: (uuid) => `/api/v1/roadmaps/${uuid}`,
  },
};
