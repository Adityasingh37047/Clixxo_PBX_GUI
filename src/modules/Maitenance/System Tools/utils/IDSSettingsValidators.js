/** IDS Settings is local-state UI; keep light numeric guards for thresholds. */

export function normalizeIdsThreshold(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function normalizeIdsValidity(value) {
  return normalizeIdsThreshold(value);
}
