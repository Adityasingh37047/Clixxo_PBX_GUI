import {
  OPERATIONS_LOG_COLUMNS,
  OPERATIONS_LOG_MESSAGES,
} from "../../../../constants/OperationsLogConstants";

const COLUMN_KEYS = OPERATIONS_LOG_COLUMNS.map((col) => col.key);

function emptyRow(rawLine, index) {
  return {
    id: `ops-log-${index}`,
    rawLine,
    time: "",
    user: "",
    ip: "",
    operation: "",
    detail: rawLine,
  };
}

function fromJsonLine(line, index) {
  try {
    const parsed = JSON.parse(line);
    return {
      id: `ops-log-${index}`,
      rawLine: line,
      time: String(parsed.time ?? parsed.timestamp ?? ""),
      user: String(parsed.user ?? parsed.username ?? ""),
      ip: String(parsed.ip ?? parsed.ipAddress ?? parsed.ip_address ?? ""),
      operation: String(parsed.operation ?? parsed.action ?? ""),
      detail: String(parsed.detail ?? parsed.message ?? ""),
    };
  } catch {
    return null;
  }
}

function fromDelimitedLine(line, delimiter, index) {
  const parts = line.split(delimiter).map((part) => part.trim());
  if (parts.length < 5) return null;
  return {
    id: `ops-log-${index}`,
    rawLine: line,
    time: parts[0] ?? "",
    user: parts[1] ?? "",
    ip: parts[2] ?? "",
    operation: parts[3] ?? "",
    detail: parts.slice(4).join(delimiter).trim(),
  };
}

export function parseOperationsLogText(responseData) {
  const text = String(responseData ?? "").trim();
  if (!text || text === OPERATIONS_LOG_MESSAGES.READ_ERROR) {
    return { rows: [], unreadable: true };
  }

  const lines = text.split(/\r?\n/).filter(Boolean);
  const rows = lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("{")) {
      return fromJsonLine(trimmed, index) ?? emptyRow(trimmed, index);
    }

    const tabRow = fromDelimitedLine(trimmed, "\t", index);
    if (tabRow) return tabRow;

    const pipeRow = fromDelimitedLine(trimmed, "|", index);
    if (pipeRow) return pipeRow;

    const commaParts = trimmed.split(",");
    if (commaParts.length >= 5) {
      return fromDelimitedLine(trimmed, ",", index);
    }

    const datetimeMatch = trimmed.match(
      /^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+(.*)$/,
    );
    if (datetimeMatch) {
      return {
        id: `ops-log-${index}`,
        rawLine: trimmed,
        time: datetimeMatch[1],
        user: "",
        ip: "",
        operation: "",
        detail: datetimeMatch[2],
      };
    }

    return emptyRow(trimmed, index);
  });

  return {
    rows: rows.filter(Boolean),
    unreadable: false,
  };
}

export function serializeOperationsLogRows(rows) {
  return rows
    .map((row) => row.rawLine)
    .filter(Boolean)
    .join("\n");
}

export function triggerOperationsLogDownload(content, fileName) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function encodeOperationsLogForShell(content) {
  return btoa(unescape(encodeURIComponent(content)));
}

export function getOperationsLogCellValue(row, key) {
  if (!row || !COLUMN_KEYS.includes(key)) return "";
  return String(row[key] ?? "");
}
