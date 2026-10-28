export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  RESUMES: "/resumes",
  INTERVIEW: (uuid) => `/interview/${uuid}`,
  INTERVIEW_SUMMARY: (uuid) => `/interview/${uuid}/summary`,
  ROADMAP: (uuid) => `/roadmaps/${uuid}`,
  SETTINGS: "/settings",
};
