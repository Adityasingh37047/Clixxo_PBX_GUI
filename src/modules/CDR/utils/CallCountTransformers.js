import { CALL_COUNT_DEFAULT_FILTERS } from "../../../constants/CallCountConstants";

export const normalizeValue = (value) =>
  String(value || "")
    .toLowerCase()
    .trim();

export const includesAny = (value, needles) => {
  const text = normalizeValue(value);
  return needles.some((needle) => text.includes(needle));
};

export const getCanonicalDirectionFromValue = (value) => {
  const raw = normalizeValue(value);
  if (!raw) return "";

  if (
    raw === "from-external" ||
    raw.startsWith("from-external") ||
    raw.includes("from-trunk") ||
    raw.includes("from-pstn") ||
    raw === "inbound" ||
    raw.includes("inbound")
  ) {
    return "inbound";
  }

  if (
    raw === "from-internal" ||
    raw.startsWith("from-internal") ||
    raw === "local" ||
    raw === "internal" ||
    raw.includes("local") ||
    raw.includes("internal")
  ) {
    return "local";
  }

  if (
    raw === "outbound" ||
    raw.includes("outbound") ||
    raw.includes("outgoing")
  ) {
    return "outbound";
  }

  if (raw === "forwarded" || raw.includes("forwarded")) {
    return "forwarded";
  }

  if (
    raw.includes("voicemail") ||
    raw.includes("ivr") ||
    raw.includes("queue") ||
    raw.includes("conference") ||
    raw.includes("conf")
  ) {
    return "local";
  }

  return raw;
};

export const getCanonicalDirections = (row) => {
  const directions = [row.call_direction, row.direction, row.dcontext]
    .map(getCanonicalDirectionFromValue)
    .filter(Boolean);

  return Array.from(new Set(directions));
};

export const getCanonicalDirection = (row) => getCanonicalDirections(row)[0] || "";

export const getCanonicalStatusesFromValue = (value) => {
  const raw = normalizeValue(value);
  const compact = raw.replace(/[\s_-]+/g, "");
  const statuses = [];

  if (!raw) return statuses;

  if (includesAny(raw, ["conference", "confbridge", "conf"])) {
    statuses.push("conference");
  }
  if (includesAny(raw, ["call queue", "queue"])) {
    statuses.push("call queue");
  }
  if (includesAny(raw, ["voicemail", "voice mail", "vm"])) {
    statuses.push("voicemail");
  }
  if (includesAny(raw, ["ivr"])) {
    statuses.push("ivr");
  }

  if (
    raw === "no answer" ||
    raw === "no-answer" ||
    raw === "no_answer" ||
    compact === "noanswer" ||
    raw === "no answer" ||
    raw === "busy" ||
    includesAny(raw, ["miss", "unanswered"])
  ) {
    statuses.push("noanswer");
  }

  if (raw === "answered" || raw === "answer" || raw === "completed") {
    statuses.push("answered");
  }

  if (
    raw === "cancelled" ||
    raw === "canceled" ||
    includesAny(raw, ["cancel"])
  ) {
    statuses.push("cancelled");
  }

  if (
    raw === "failed" ||
    raw === "failure" ||
    raw === "congestion" ||
    raw === "chanunavail" ||
    raw === "channel unavailable" ||
    includesAny(raw, ["fail"])
  ) {
    statuses.push("failed");
  }

  if (!statuses.length) {
    statuses.push(raw);
  }

  return statuses;
};

export const getDispositionStatus = (row) => {
  const raw = normalizeValue(row.disposition);
  const compact = raw.replace(/[\s_-]+/g, "");

  if (!raw) return "";
  if (raw === "answered" || raw === "answer" || raw === "completed") {
    return "answered";
  }
  if (
    raw === "no answer" ||
    raw === "no-answer" ||
    raw === "no_answer" ||
    compact === "noanswer" ||
    compact === "noanswered" ||
    raw === "busy" ||
    includesAny(raw, ["miss", "unanswered"])
  ) {
    return "noanswer";
  }
  if (
    raw === "cancelled" ||
    raw === "canceled" ||
    includesAny(raw, ["cancel"])
  ) {
    return "cancelled";
  }
  if (
    raw === "failed" ||
    raw === "failure" ||
    raw === "congestion" ||
    raw === "chanunavail" ||
    raw === "channel unavailable" ||
    includesAny(raw, ["fail"])
  ) {
    return "failed";
  }

  return raw;
};

export const getFallbackStatus = (row) =>
  getDispositionStatus({ disposition: row.call_status || row.status });

export const getCanonicalCallStatuses = (row) => {
  const dispositionStatus = getDispositionStatus(row) || getFallbackStatus(row);
  const contextStatuses = [row.dcontext, row.hangup_cause].reduce(
    (statuses, value) => [
      ...statuses,
      ...getCanonicalStatusesFromValue(value).filter((status) =>
        ["voicemail", "ivr", "call queue", "conference"].includes(status),
      ),
    ],
    [],
  );

  return Array.from(
    new Set([dispositionStatus, ...contextStatuses].filter(Boolean)),
  );
};

export const getDirection = (row) => {
  const direction = getCanonicalDirection(row);
  if (!direction) return "";
  if (direction === "inbound") return "Inbound";
  if (direction === "outbound") return "Outbound";
  if (direction === "local") return "Local";
  if (direction === "forwarded") return "Forwarded";

  return direction.charAt(0).toUpperCase() + direction.slice(1);
};

export const statusStyle = (s) => {
  const v = String(s || "").toLowerCase();

  if (v === "answered") return { color: "#16A34A" };
  if (v === "failed") return { color: "#DC2626" };
  if (v === "busy") return { color: "#92400e" };

  if (v === "no answer" || v === "cancelled") {
    return { color: "#c2410c" };
  }

  return { color: "#64748b" };
};

export const formatDuration = (secs) => {
  const s = Number(secs) || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${h}:${pad(m)}:${pad(sec)}`;
};

export const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  } catch {
    return value;
  }
};

export const DEFAULT_FILTERS = { ...CALL_COUNT_DEFAULT_FILTERS };

export const DEFAULT_APPLIED_MODIFY_DRAFT = {
  talkDurationOperator: ">",
  talkDurationSeconds: "",
};

export const matchesCallStatus = (row, status) => {
  const selectedStatus = normalizeValue(status);
  if (!selectedStatus || selectedStatus === "all") return true;

  if (
    ["answered", "noanswer", "cancelled", "failed"].includes(selectedStatus)
  ) {
    const visibleStatus = getDispositionStatus(row) || getFallbackStatus(row);
    return visibleStatus === selectedStatus;
  }

  return getCanonicalCallStatuses(row).includes(selectedStatus);
};

export const matchesDirectionFilter = (row, direction) => {
  const selectedDirection = normalizeValue(direction);
  if (!selectedDirection || selectedDirection === "all") return true;

  return getCanonicalDirection(row) === selectedDirection;
};

export const matchesSearch = (row, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    row.src,
    row.dst,
    row.src_ip,
    row.dst_ip,
    row.dcontext,
    row.disposition,
    row.hangup_cause,
    row.call_direction,
    row.direction,
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  return haystack.includes(q);
};

export const matchesTrunkName = (row, trunkName) => {
  const q = String(trunkName || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.trunk_name || "")
    .toLowerCase()
    .includes(q);
};

export const matchesCallFrom = (row, callFrom) => {
  const q = String(callFrom || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.src || "")
    .toLowerCase()
    .includes(q);
};

export const matchesCallTo = (row, callTo) => {
  const q = String(callTo || "")
    .trim()
    .toLowerCase();
  if (!q) return true;
  return String(row.dst || "")
    .toLowerCase()
    .includes(q);
};

export const matchesTalkDuration = (row, operator, seconds) => {
  const raw = String(seconds ?? "").trim();
  if (!raw) return true;
  const target = Number(raw);
  if (Number.isNaN(target)) return true;

  const actual = Number(row.duration ?? row.billsec ?? 0);
  if (Number.isNaN(actual)) return false;

  if (operator === "<") return actual < target;
  if (operator === ">") return actual > target;
  if (operator === "<=") return actual <= target;
  if (operator === ">=") return actual >= target;
  return actual === target;
};

export const parseRowCallDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const matchesDateRange = (row, startDate, endDate) => {
  const rowDate = parseRowCallDate(row.calldate);
  if (!rowDate) return !startDate && !endDate;

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`);
    if (rowDate < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`);
    if (rowDate > end) return false;
  }
  return true;
};

export const getRowKey = (row, idx) =>
  [
    row.uniqueid,
    row.calldate,
    row.src,
    row.dst,
    row.disposition,
    row.billsec,
    idx,
  ]
    .map((value) => normalizeValue(value))
    .join("|");

export const hasRecording = (row) => {
  const f = row?.recordingfile;
  return typeof f === "string" && f.trim() !== "";
};

export const formatCallCountFilterTooltipTitle = (text) => {
  if (!text) return "";
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
};
