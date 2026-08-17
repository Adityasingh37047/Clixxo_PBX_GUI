/**
 * When the backend reports that a number is already used by another
 * feature (Ring Group, IVR, Conference, Call Queue, Paging, Speed Dial...),
 * show only the leading "Number X is already used by Y" part and drop
 * everything after it (e.g. a quoted resource name), then add a clean
 * closing sentence. Example:
 *   Number 1234 is already used by IVR "gergbe" (extra backend text)
 * becomes:
 *   Number 1234 is already used by IVR. Choose a different number.
 */
const formatDuplicateNumberMessage = (text) => {
  const match = String(text).match(
    /number\s+\d+\s+is\s+already\s+(?:used|in\s+use)\s+by\s+[A-Za-z][A-Za-z0-9 _-]*/i,
  );
  if (!match) return null;

  const leading = match[0].trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
  return `${leading}. Choose a different number.`;
};

/**
 * Cleans up a raw backend message string (from either a thrown axios error
 * or a "soft failure" response body like { response: false, message }) so
 * it can be shown directly in a toast/banner.
 */
export const cleanErrorText = (text, fallback) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return fallback;
  return formatDuplicateNumberMessage(trimmed) || trimmed;
};

/**
 * Extracts a human-readable error message from an API/axios error.
 * Prefers the backend-provided message (e.g. "Number 123 is already used by IVR")
 * over the generic axios message (e.g. "Request failed with status code 400").
 * Does not change/call any API - purely reformats the message already
 * returned by the existing API call for display in the toast/banner.
 */
export const getApiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const backendMessage =
    (typeof data === "string" ? data : data?.message || data?.error) || null;

  if (backendMessage && String(backendMessage).trim()) {
    return cleanErrorText(backendMessage, fallback);
  }

  return error?.message || fallback;
};
