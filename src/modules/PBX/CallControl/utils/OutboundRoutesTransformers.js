import {
  OUTBOUND_ROUTE_DEFAULT_CALLER_CONVERSION,
  OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN,
} from "../../../../constants/OutboundRouteConstants";

export const normalizeOutboundRouteList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

export const toOutboundRouteUiYesNo = (value, defaultValue = "No") => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return defaultValue;
};

export const toOutboundRouteApiYesNo = (value, defaultValue = "no") => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return defaultValue;
};

export const mapOutboundRoutePasswordTypeToUi = (apiValue) =>
  String(apiValue || "").toLowerCase() === "single_pin" ? "Single Pin" : "None";
export const mapOutboundRoutePasswordTypeToApi = (uiValue) =>
  uiValue === "Single Pin" ? "single_pin" : "none";

export const mapOutboundRouteFromApi = (item) => {
  const timeCond = item?.time_condition || {};
  const callerConv = item?.caller_number_conversion || {};
  const dial = Array.isArray(item?.dial_patterns) ? item.dial_patterns : [];
  const timeConditions = [];
  const all = !!timeCond?.all;
  if (timeCond?.work_time) timeConditions.push("WorkTime");
  if (all) timeConditions.push("All");
  if (all && timeCond?.holiday) timeConditions.push("Holiday");
  const nextRoute = typeof item?.next_route === "string"
    ? item.next_route.toLowerCase() === "yes" : !!item?.next_route;
  const rememoryHunt = typeof item?.rrmemory_hunt === "string"
    ? item.rrmemory_hunt.toLowerCase() === "yes" : !!item?.rrmemory_hunt;
  return {
    id: item?.id, name: String(item?.name || ""), priority: String(item?.priority ?? ""),
    description: String(item?.description || ""), nextRoute,
    enabled: toOutboundRouteUiYesNo(item?.enabled, "Yes"),
    passwordType: mapOutboundRoutePasswordTypeToUi(item?.password_type),
    singlePin: item?.password_pin != null ? String(item.password_pin) : "",
    rememoryHunt: rememoryHunt ? "Yes" : "No", timeConditions,
    callerConversion: { strip: String(callerConv?.strip ?? 0), front: String(callerConv?.front ?? ""), suffix: String(callerConv?.suffix ?? "") },
    memberExtensions: Array.isArray(item?.member_extensions) ? item.member_extensions.map(String) : [],
    memberTrunks: Array.isArray(item?.member_trunks) ? item.member_trunks.map(String) : [],
    dialPatterns: dial.length > 0 ? dial.map((d) => ({ pattern: String(d?.pattern ?? ""), strip: String(d?.strip ?? 0), front: String(d?.front ?? ""), suffix: String(d?.suffix ?? ""), delay: String(d?.delay_ms ?? 0) })) : [{ ...OUTBOUND_ROUTE_DEFAULT_DIAL_PATTERN, pattern: "^\\d*$" }],
  };
};

export const buildOutboundRoutePayload = (form) => {
  const dialPatterns = form.dialPatterns.filter((d) => String(d.pattern || "").trim()).map((d) => ({
    pattern: String(d.pattern || "").trim(), strip: Number(d.strip || 0),
    front: String(d.front || ""), suffix: String(d.suffix || ""), delay_ms: Number(d.delay || 0),
  }));
  return {
    name: form.name.trim(), priority: Number(form.priority), description: form.description || null,
    next_route: toOutboundRouteApiYesNo(form.nextRoute ? "yes" : "no", "yes"),
    enabled: toOutboundRouteApiYesNo(form.enabled, "yes"),
    password_type: mapOutboundRoutePasswordTypeToApi(form.passwordType),
    password_pin: form.passwordType === "Single Pin" ? form.singlePin.trim() : null,
    rrmemory_hunt: toOutboundRouteApiYesNo(form.rememoryHunt, "no"),
    time_condition: { work_time: form.timeConditions.includes("WorkTime"), holiday: form.timeConditions.includes("Holiday"), all: form.timeConditions.includes("All") },
    dial_patterns: dialPatterns.length > 0 ? dialPatterns : [{ pattern: "^\\d*$" }],
    caller_number_conversion: { strip: Number(form.callerConversion.strip || 0), front: String(form.callerConversion.front || ""), suffix: String(form.callerConversion.suffix || "") },
    member_extensions: [...form.memberExtensions], member_trunks: [...form.memberTrunks],
  };
};
