/** Light numeric guards for DDOS limit / blacklist-time fields. */

export function normalizeDdosLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function normalizeDdosBlacklistTime(value) {
  return normalizeDdosLimit(value);
}
