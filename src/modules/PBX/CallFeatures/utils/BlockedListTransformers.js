export const mapBlockedListFromApi = (item) => ({
  id: item.id,
  name: item.name || "",
  matchMode:
    item.match_mode === "regex"
      ? "Regex Match"
      : item.match_mode === "extension"
        ? "Extension"
        : "Exact Match",
  blockedNumber: item.pattern || "",
  direction: (() => {
    const d = (item.direction || "").toLowerCase();
    if (d === "outbound") return "Outbound";
    if (d === "internal") return "Internal";
    return "Inbound";
  })(),
  enabled:
    item.enabled === false || String(item.enabled).toLowerCase() === "no"
      ? "No"
      : "Yes",
});

export const normalizeBlockedListList = (res) => {
  const raw = res?.message ?? res?.data ?? res;
  return Array.isArray(raw) ? raw : [];
};

export const mapConferenceExtensionsFromApi = (extRes) => {
  const extRaw = Array.isArray(extRes?.message)
    ? extRes.message
    : Array.isArray(extRes?.data)
      ? extRes.data
      : [];
  return extRaw
    .filter((e) => e && e.extension)
    .map((e) => ({
      value: String(e.extension),
      label: e.display_name
        ? `${e.display_name} (${e.extension})`
        : String(e.extension),
    }));
};

export const blockedListFormFromRow = (row) => ({
  editId: row.id,
  name: row.name || "",
  matchMode: row.matchMode,
  blockedNumber: row.blockedNumber || "",
  selectedExtension:
    row.matchMode === "Extension" ? row.blockedNumber || "" : "",
  direction: row.direction,
  enabled: row.enabled,
});

export const buildBlockedListApiPayload = ({
  name,
  matchMode,
  blockedNumber,
  selectedExtension,
  direction,
  enabled,
}) => {
  const trimmedName = name.trim();
  const trimmedNumber = blockedNumber.trim();
  const valueToBlock =
    matchMode === "Extension"
      ? String(selectedExtension || "").trim()
      : trimmedNumber;

  return {
    name: trimmedName,
    match_mode:
      matchMode === "Regex Match"
        ? "regex"
        : matchMode === "Extension"
          ? "extension"
          : "exact",
    pattern: valueToBlock,
    direction: direction.toLowerCase(),
    enabled: enabled === "Yes",
  };
};
