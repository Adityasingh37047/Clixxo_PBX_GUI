export const toUiYesNo = (value, defaultValue = "No") => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return defaultValue;
};

export const toApiYesNo = (value, defaultValue = "no") => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return defaultValue;
};

export const mapRestrictionFromApi = (item) => ({
  id: item?.id,
  name: String(item?.name || ""),
  timeLimit: String(
    item?.time_limit ?? item?.timeLimit ?? item?.time_limit_sec ?? "",
  ),
  callsLimit: String(
    item?.calls_limit ??
      item?.number_of_calls_limit ??
      item?.callsLimit ??
      item?.call_limit ??
      "",
  ),
  autoCancelRestriction: toUiYesNo(
    item?.auto_cancel_restriction ?? item?.auto_cancel ?? item?.autoCancel,
    "No",
  ),
  memberExtensions: Array.isArray(item?.member_extensions)
    ? item.member_extensions.map(String)
    : Array.isArray(item?.extensions)
      ? item.extensions.map(String)
      : [],
  enabled: toUiYesNo(item?.enabled ?? item?.enable, "Yes"),
});

export const normalizeOutboundRestrictionList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : res?.message
      ? [res.message]
      : [];
  return list;
};

/** Maps `listIvrDestinations` response (`message.Extensions`) used by loadDestinations. */
export const mapDestinationExtensionsFromApi = (res) => {
  const msg = res?.message || {};
  return (msg.Extensions || []).map((item) => ({
    extension: String(item?.value ?? "").trim(),
    label: String(item?.label ?? "").trim(),
  }));
};

/** Maps `listOutboundRouteExtensions` response used by loadExtensions. */
export const mapOutboundRouteExtensionsFromApi = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list
    .map((item) => ({
      extension: String(item?.extension ?? item?.id ?? "").trim(),
      label: String(
        item?.label ?? item?.name ?? item?.extension ?? item?.id ?? "",
      ).trim(),
    }))
    .filter((item) => item.extension)
    .sort(
      (a, b) =>
        (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0),
    );
};

export const buildOutboundRestrictionApiPayload = ({
  name,
  timeLimit,
  callsLimit,
  autoCancelRestriction,
  memberExtensions,
  enabled,
}) => ({
  name: name.trim(),
  time_limit: timeLimit.trim(),
  calls_limit: callsLimit.trim(),
  auto_cancel_restriction: toApiYesNo(autoCancelRestriction),
  member_extensions: [...memberExtensions],
  enabled: toApiYesNo(enabled, "yes"),
});
