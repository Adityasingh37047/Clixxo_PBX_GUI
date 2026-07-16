/** Certificate Manage is local-state UI; keep light string normalization. */

export function normalizeCertificateFieldValue(value) {
  if (value == null) return "";
  return String(value);
}
