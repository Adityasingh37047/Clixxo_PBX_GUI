/** Authorization page is read-only display — no form-field validators. */

export function isAuthorizedSerial(serial) {
  return Boolean(String(serial || "").trim());
}
