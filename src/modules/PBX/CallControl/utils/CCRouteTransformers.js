import {
  CC_ROUTE_INTERVAL_OPTIONS,
  CC_ROUTE_KEEP_MINUTES_TO_LABEL,
} from "../../../../constants/CCRouteConstants";

const CC_ROUTE_INTERVAL_VALUE_SET = new Set(
  CC_ROUTE_INTERVAL_OPTIONS.map((o) => o.value),
);

export const getCcRouteIntervalLabel = (value) => {
  const found = CC_ROUTE_INTERVAL_OPTIONS.find(
    (o) => o.value === String(value),
  );
  return found ? found.label : `${value}s`;
};

export const normalizeThroughFromApi = (value) => {
  const mode = String(value || "").toLowerCase();
  return mode === "from_come_in" || mode === "from come in"
    ? "From Come In"
    : "Auto";
};

export const normalizeEnabledFromApi = (value) =>
  value === true || String(value || "").toLowerCase() === "yes" ? "Yes" : "No";

export const normalizeRecordKeepTime = (route) => {
  if (route?.record_keep_time) return String(route.record_keep_time);
  const minutes = Number(route?.keep_minutes);
  return CC_ROUTE_KEEP_MINUTES_TO_LABEL[minutes] || "8 hours";
};

export const normalizeCcRoute = (item) => {
  const rawInterval = Number(item.interval_minutes ?? item.cc_interval_time);
  const normalizedInterval =
    Number.isFinite(rawInterval) && rawInterval > 0
      ? rawInterval <= 5
        ? rawInterval * 60
        : rawInterval
      : 10;
  const ccIntervalTime = CC_ROUTE_INTERVAL_VALUE_SET.has(
    String(normalizedInterval),
  )
    ? String(normalizedInterval)
    : "10";
  return {
    id: item.id,
    ccIntervalTime,
    through: normalizeThroughFromApi(item.through_mode ?? item.through),
    recordKeepTime: normalizeRecordKeepTime(item),
    enabled: normalizeEnabledFromApi(item.enabled ?? item.enable),
    memberExtensions: Array.isArray(item.extensions)
      ? item.extensions.map(String)
      : [],
  };
};

export const normalizeCcRouteList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list;
};

export const normalizeCcRouteExtensionsList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : Array.isArray(res?.data)
      ? res.data
      : [];
  return list
    .map((item) => ({
      extension: String(item?.extension ?? "").trim(),
      label: String(item?.label ?? item?.extension ?? "").trim(),
    }))
    .filter((item) => item.extension)
    .sort(
      (a, b) =>
        (parseInt(a.extension, 10) || 0) - (parseInt(b.extension, 10) || 0),
    );
};

export const buildCcRoutePayload = ({
  ccIntervalTime,
  through,
  recordKeepTime,
  enabled,
  selectedExtensions,
}) => ({
  cc_interval_time: Number(ccIntervalTime),
  through,
  record_keep_time: recordKeepTime,
  enable: enabled,
  extensions: selectedExtensions,
});
