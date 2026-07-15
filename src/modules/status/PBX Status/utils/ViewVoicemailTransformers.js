export const parseCallerId = (raw) => {
  if (!raw) return "—";
  const match = raw.match(/<([^>]+)>/) || raw.match(/^"?([^"<]+)"?$/);
  return match ? match[1].trim() : raw.trim();
};

export const fmtDuration = (secs) => {
  const s = Number(secs) || 0;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  } catch {
    return iso;
  }
};
