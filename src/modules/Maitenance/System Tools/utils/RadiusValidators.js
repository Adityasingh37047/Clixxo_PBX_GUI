/** Radius is local-state UI; keep light string normalization. */

export function normalizeRadiusFieldValue(value) {
  if (value == null) return "";
  return String(value);
}
