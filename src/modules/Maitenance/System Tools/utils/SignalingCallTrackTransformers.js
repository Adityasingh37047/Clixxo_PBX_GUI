import {
  SIGNALING_CALL_TRACK_LOG_CANDIDATES,
  SIGNALING_CALL_TRACK_LINUX_COMMANDS,
  SIGNALING_CALL_TRACK_CMD_RESULTS,
} from "../../../../constants/SignalingCallTrackConstants";

export function extractCmdOutput(res) {
  return String(res?.responseData ?? res?.data ?? "").trim();
}

export function applyTrackFilter(text, type, value) {
  if (!text) return "";
  if (type === "none" || !String(value || "").trim()) return text;

  const needle = String(value).trim().toLowerCase();
  const lines = text.split("\n");

  if (type === "caller") {
    return lines
      .filter((line) => {
        const lower = line.toLowerCase();
        if (!lower.includes(needle)) return false;
        return (
          lower.includes("caller") ||
          lower.includes("from:") ||
          lower.includes("cli") ||
          lower.includes("from-uri") ||
          lower.includes("from_uri")
        );
      })
      .join("\n");
  }

  if (type === "callee") {
    return lines
      .filter((line) => {
        const lower = line.toLowerCase();
        if (!lower.includes(needle)) return false;
        return (
          lower.includes("callee") ||
          lower.includes("to:") ||
          lower.includes("called") ||
          lower.includes("to-uri") ||
          lower.includes("to_uri") ||
          lower.includes("request-uri")
        );
      })
      .join("\n");
  }

  return lines.filter((line) => line.toLowerCase().includes(needle)).join("\n");
}

export async function resolveAsteriskLogPath(postLinuxCmd) {
  for (const path of SIGNALING_CALL_TRACK_LOG_CANDIDATES) {
    const res = await postLinuxCmd({
      cmd: SIGNALING_CALL_TRACK_LINUX_COMMANDS.CHECK_READABLE(path),
    });
    if (extractCmdOutput(res) === SIGNALING_CALL_TRACK_CMD_RESULTS.OK) {
      return path;
    }
  }
  return SIGNALING_CALL_TRACK_LOG_CANDIDATES[0];
}

export function appendRawMessage(prev, chunk) {
  if (!chunk) return prev;
  return prev ? `${prev}\n${chunk}` : chunk;
}

export function getTrackDownloadFilename() {
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
  return `signaling_call_track_${dateStr}.txt`;
}

export function triggerTextFileDownload(content, filename) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function canApplyTrackFilter(filterType, filterValue) {
  return filterType === "none" || Boolean(filterValue.trim());
}
