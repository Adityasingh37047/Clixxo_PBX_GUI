export const DISA_INITIAL_FORM = {
  name: "",
  responseTimeout: "10",
  digitTimeout: "5",
  secondDial: "Enable",
  transparent: "Disable",
  pinType: "None",
  pin: "",
  outboundRoutes: [],
  enabled: true,
};

export const normalizeDisaList = (raw) => {
  const list = raw?.message ?? raw?.data ?? raw;
  return Array.isArray(list) ? list : [];
};

export const asBool = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (["true", "1", "yes", "enable", "enabled"].includes(v)) return true;
    if (["false", "0", "no", "disable", "disabled"].includes(v)) return false;
  }
  return fallback;
};

export const normalizePinType = (value) => {
  if (String(value || "").toLowerCase() === "single_pin") return "Single Pin";
  return "None";
};

export const mapDisaFromApi = (item) => {
  const outboundIdsRaw = Array.isArray(item?.outbound_routes)
    ? item.outbound_routes
    : Array.isArray(item?.outboundRoutes)
      ? item.outboundRoutes
      : [];
  const outboundRoutes = outboundIdsRaw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  return {
    id: item?.id,
    name: String(item?.name || ""),
    responseTimeout: String(
      item?.response_timeout ?? item?.responseTimeout ?? 10,
    ),
    digitTimeout: String(item?.digit_timeout ?? item?.digitTimeout ?? 5),
    secondDial: asBool(item?.second_dial ?? item?.secondDial, true)
      ? "Enable"
      : "Disable",
    transparent: asBool(item?.transparent, false) ? "Enable" : "Disable",
    pinType: normalizePinType(item?.pin_type ?? item?.pinType),
    pin: String(item?.pin_number ?? item?.pin ?? ""),
    outboundRoutes,
    enabled: asBool(item?.enabled, true),
  };
};

export const mapOutboundRoutesFromApi = (res) => {
  const list = normalizeDisaList(res);
  return list
    .map((r) => ({
      id: Number(r?.id),
      name: String(r?.name || r?.route_name || ""),
    }))
    .filter((r) => Number.isFinite(r.id) && r.name);
};

export const buildDisaApiPayload = (form) => {
  const respTimeout = Number(form.responseTimeout);
  const digTimeout = Number(form.digitTimeout);

  return {
    name: form.name.trim(),
    response_timeout: respTimeout,
    digit_timeout: digTimeout,
    second_dial: form.secondDial === "Enable",
    transparent: form.transparent === "Enable",
    pin_type: form.pinType === "Single Pin" ? "single_pin" : "none",
    pin_number: form.pinType === "Single Pin" ? form.pin.trim() : "",
    outbound_routes: form.outboundRoutes,
    enabled: !!form.enabled,
  };
};

export const formatOutboundRoutesCell = (routeIds, routeNameById) => {
  const routeNames = routeIds.map(
    (id) => routeNameById.get(id) || `ID:${id}`,
  );
  const text = routeNames.slice(0, 3).join(", ");
  const extra = routeNames.length > 3 ? ` +${routeNames.length - 3}` : "";
  return `${text}${extra}`;
};
