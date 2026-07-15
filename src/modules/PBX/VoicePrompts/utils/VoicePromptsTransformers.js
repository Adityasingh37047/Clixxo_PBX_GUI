export const normalizeList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

export const safeFilename = (v) => String(v || "").trim();

export const normalizeMohClassList = (res) => {
  const msg = res?.message ?? res?.data ?? {};
  const raw = Array.isArray(msg?.moh_classes)
    ? msg.moh_classes
    : Array.isArray(msg?.classes)
      ? msg.classes
      : Array.isArray(msg?.categories)
        ? msg.categories
        : Array.isArray(msg)
          ? msg
          : Array.isArray(res?.data)
            ? res.data
            : [];
  return raw
    .map((x) =>
      typeof x === "string" ? x : x?.name || x?.category || x?.class || "",
    )
    .map((x) => String(x).trim())
    .filter(Boolean);
};

export const triggerBrowserDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const toMessageText = (msg, fallback) => {
  if (typeof msg === "string" && msg.trim()) return msg;
  if (msg && typeof msg === "object") {
    if (typeof msg.message === "string" && msg.message.trim())
      return msg.message;
    if (typeof msg.error === "string" && msg.error.trim()) return msg.error;
    if (typeof msg.details === "string" && msg.details.trim())
      return msg.details;
  }
  return fallback;
};

export const mapVoicePromptPreferencesFromApi = (prefRes) => {
  const msg = prefRes?.message ?? prefRes?.data ?? {};
  return {
    promptMohCategory: String(msg?.music_on_hold || "default"),
    playCallForwardingPrompt: !!msg?.play_call_forwarding_prompt,
  };
};

export const mapVoicePromptExtensionsFromApi = (extRes) => {
  const list = normalizeList(extRes);
  const extList = list
    .map((x) => String(x?.extension ?? x?.ext ?? x).trim())
    .filter(Boolean);
  return Array.from(new Set(extList));
};

export const mapCustomPromptFromApi = (it, idx) => ({
  id: it?.id ?? `${idx}`,
  recordingName: String(
    it?.recording_name || it?.name || it?.filename || "",
  ).replace(/\.[^/.]+$/, ""),
  fileName: safeFilename(it?.filename || it?.file_name || it?.file || ""),
  extension: String(it?.extension || it?.ext || "--"),
  sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
  uploadedAt: it?.uploaded_at || it?.uploaded || it?.date || "",
});

export const mapCustomPromptListFromApi = (res) => {
  const list = normalizeList(res);
  return list.map((it, idx) => mapCustomPromptFromApi(it, idx));
};

export const mapMohFileFromApi = (it, idx) => ({
  id: it?.id ?? `${idx}`,
  category: String(it?.category || ""),
  filename: safeFilename(it?.filename || it?.file_name || it?.name || it),
  sizeBytes: Number(it?.size_bytes ?? it?.size ?? 0) || 0,
  uploadedAt:
    it?.uploaded_at || it?.created_at || it?.uploaded || it?.date || "",
});

export const mapMohFileListFromApi = (res) => {
  const msg = res?.message ?? res?.data ?? {};
  const list = Array.isArray(msg)
    ? msg
    : Array.isArray(msg?.files)
      ? msg.files
      : Array.isArray(res?.data)
        ? res.data
        : [];
  return list.map((it, idx) => mapMohFileFromApi(it, idx));
};
