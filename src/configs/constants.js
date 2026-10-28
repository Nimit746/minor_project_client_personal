/**
 * Application constants, constraints, and defaults.
 */

export const APP_CONFIG = {
  APP_NAME: "Nexora",
  APP_TAGLINE: "AI-calibrated mock interview platform tailored to your target company and real resume.",
  
  // File upload constraints
  RESUME: {
    MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
    ALLOWED_MIME_TYPES: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    ALLOWED_EXTENSIONS: [".pdf", ".docx"],
  },

  // Input limits
  LIMITS: {
    ANSWER_MAX_LENGTH: 20000,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 72,
  },

  // Polling intervals (in ms)
  POLLING: {
    RESUME_INTERVAL: 2500,
    ROADMAP_INTERVAL: 3000,
    DEFAULT_MAX_ATTEMPTS: 30,
  },

  // Mock interview presets
  INTERVIEW: {
    DEFAULT_ROLE: "Full Stack Engineer",
    DEFAULT_DIFFICULTY: "medium",
    DIFFICULTIES: ["easy", "medium", "hard"],
    DEFAULT_TOTAL_TURNS: 8,
  },
};
