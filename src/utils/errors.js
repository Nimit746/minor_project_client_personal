/**
 * Normalizes FastAPI error responses into human-readable strings.
 *
 * FastAPI error structures:
 * - 422: { detail: [{ loc: [...], msg: "...", type: "..." }] }
 * - 400/401/403/404: { detail: "string error message" }
 * - generic: { message: "..." } or fallback string
 */

export function getErrorMessage(err) {
  if (!err) return "An unexpected error occurred.";

  // Handle standard JavaScript Error object or TypeError (e.g., Failed to fetch)
  if (err instanceof Error) {
    if (err.message.includes("Failed to fetch") || err.name === "TypeError") {
      return "Cannot connect to the server. Please verify FastAPI is running at http://localhost:8000 and CORS is enabled for http://localhost:3000.";
    }
    return err.message;
  }

  // Handle FastAPI detail array (422 validation errors)
  if (Array.isArray(err.detail)) {
    return err.detail.map((d) => d.msg || JSON.stringify(d)).join(" · ");
  }

  // Handle FastAPI detail string (400, 401, 403, 404, etc.)
  if (typeof err.detail === "string") {
    return err.detail;
  }

  if (typeof err.message === "string") {
    if (err.message.includes("Failed to fetch")) {
      return "Cannot connect to the server. Please verify FastAPI is running at http://localhost:8000 and CORS is enabled for http://localhost:3000.";
    }
    return err.message;
  }

  // Handle nested error object e.g. { error: { message: "...", code: "..." } }
  if (err.error) {
    if (typeof err.error === "string") return err.error;
    if (typeof err.error.message === "string") return err.error.message;
    if (typeof err.error.detail === "string") return err.error.detail;
  }

  if (typeof err === "string") {
    return err;
  }

  // Last resort: log the raw error and show status code if available
  console.error("[API Error]", err);
  if (err._status) {
    return `Server error (HTTP ${err._status}). Check the browser console for details.`;
  }

  return "An unexpected error occurred. Please check browser console (F12) for details.";
}

