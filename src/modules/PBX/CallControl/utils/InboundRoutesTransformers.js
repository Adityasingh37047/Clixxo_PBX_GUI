import {
  INBOUND_ROUTE_DEST_TYPE_TO_UI,
  INBOUND_ROUTE_UI_TO_DEST_TYPE,
} from "../../../../constants/InboundRouteConstants";

export const toInboundRouteUiYesNo = (value, defaultValue = "No") => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized === "yes") return "Yes";
    if (normalized === "no") return "No";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return defaultValue;
};

export const toInboundRouteApiYesNo = (value, defaultValue = "no") => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "yes") return "yes";
  if (normalized === "no") return "no";
  return defaultValue;
};

export const mapInboundDestTypeToUi = (destType) =>
  INBOUND_ROUTE_DEST_TYPE_TO_UI[String(destType || "").toLowerCase()] || "";

export const mapInboundUiToDestType = (uiDest) =>
  INBOUND_ROUTE_UI_TO_DEST_TYPE[uiDest] || "call_queue";

/** Ring-group list API uses `rg_number` (same as Ring Group page); do not use DB id as dial target. */
export const getRingGroupDialNumber = (g) => {
  if (!g || typeof g !== "object") return "";
  const n =
    g.rg_number ?? g.ring_group_no ?? g.group_no ?? g.group ?? g.page_number;
  if (n != null && String(n).trim() !== "") return String(n).trim();
  return "";
};

/** If dest_value was saved as ring-group row id, map it to the real group number (e.g. 6200). */
export const resolveRingGroupDestValue = (storedValue, ringGroupsList) => {
  if (storedValue == null || storedValue === "") return "";
  const s = String(storedValue).trim();
  if (!Array.isArray(ringGroupsList) || ringGroupsList.length === 0) return s;

  if (ringGroupsList.some((g) => getRingGroupDialNumber(g) === s)) return s;

  const byId = ringGroupsList.find((g) => String(g?.id) === s);
  if (byId) {
    const dial = getRingGroupDialNumber(byId);
    return dial || s;
  }
  return s;
};

export const mapInboundRouteFromApi = (item, ringGroupsList = []) => {
  const uiDestination = mapInboundDestTypeToUi(item?.dest_type);
  const rawDestValue =
    item?.dest_value != null ? String(item.dest_value) : "";
  const destinationTargetRaw =
    uiDestination === "Extension_Range"
      ? ""
      : uiDestination === "Ring Groups"
        ? resolveRingGroupDestValue(rawDestValue, ringGroupsList)
        : rawDestValue;
  return {
    id: item?.id,
    name: String(item?.name || ""),
    didPattern: String(item?.did_pattern || ""),
    callerIdPattern: String(item?.callerid_pattern || ""),
    distinctiveRingTone: String(item?.distinctive_ringtone || ""),
    enableT38: toInboundRouteUiYesNo(item?.enable_t38, "No"),
    enableTimeCondition: toInboundRouteUiYesNo(item?.enable_time_condition, "No"),
    destination: uiDestination,
    destinationTarget: destinationTargetRaw,
    extensionRange: uiDestination === "Extension_Range" ? rawDestValue : "",
    memberTrunks: Array.isArray(item?.member_trunks)
      ? item.member_trunks.map(String)
      : [],
    enabled: toInboundRouteUiYesNo(item?.enabled, "Yes"),
    priority: String(item?.priority ?? "100"),
    enableMobilityExtension: toInboundRouteUiYesNo(item?.enable_mobility_ext, "No"),
    sendRingTone: String(item?.send_ringtone || "Remote"),
  };
};

export const normalizeInboundRouteList = (res) => {
  const list = Array.isArray(res?.message)
    ? res.message
    : res?.message
      ? [res.message]
      : [];
  return list;
};

export const mapSipRegistrationsToTrunkOptions = (res) => {
  const raw = res?.message ?? res?.data ?? res;
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((t) => {
      const id = t?.trunkId || t?.trunk_id || t?.id || t;
      const name = t?.name || t?.trunk_name || "";
      const host = t?.host || t?.sip_server || "";
      let label = "";
      if (name && host) label = `${name}@${host}`;
      else if (name) label = name;
      else if (host) label = host;
      else label = String(id || "");
      return { id: String(id), label: label || String(id || "") };
    })
    .filter((t) => t.id);
};

export const DEST_UI_TO_API_KEY = {
  Extensions: "Extensions",
  Voicemails: "Voicemails",
  "Fax To Mail": "FaxToMail",
  "Ring Groups": "RingGroups",
  "Conference Rooms": "ConferenceRooms",
  "IVR Menus": "IVR",
  "Call Queue": "CallQueue",
  CallBacks: "Callbacks",
  DISA: "DISA",
  Trunks: "Trunks",
  Outbound: "Outbound",
  Other: "Other",
};

export const getInboundDestinationChoices = (destination, destinations) => {
  const apiKey = DEST_UI_TO_API_KEY[destination];
  if (!apiKey) return [];
  const list = Array.isArray(destinations[apiKey]) ? destinations[apiKey] : [];
  return list.map((opt) => ({
    id: String(opt.value),
    label: String(opt.label),
  }));
};

export const buildInboundRouteApiPayload = ({
  name,
  didPattern,
  callerIdPattern,
  distinctiveRingTone,
  enableT38,
  enableTimeCondition,
  destination,
  destinationTarget,
  extensionRange,
  enabled,
  priority,
  enableMobilityExtension,
  sendRingTone,
  memberTrunks,
}) => {
  const parsedPriority = Number(priority);
  const destType = mapInboundUiToDestType(destination);
  const destValue =
    destination === "Extension_Range"
      ? extensionRange.trim()
      : destinationTarget;

  return {
    name,
    did_pattern: didPattern || "",
    callerid_pattern: callerIdPattern || "",
    distinctive_ringtone: distinctiveRingTone || "",
    enable_t38: toInboundRouteApiYesNo(enableT38, "no"),
    enable_time_condition: toInboundRouteApiYesNo(enableTimeCondition, "no"),
    dest_type: destType,
    dest_value: destValue || "",
    member_trunks: Array.isArray(memberTrunks) ? memberTrunks : [],
    enabled: toInboundRouteApiYesNo(enabled, "yes"),
    priority: parsedPriority,
    enable_mobility_ext: toInboundRouteApiYesNo(enableMobilityExtension, "no"),
    send_ringtone: sendRingTone || "Remote",
  };
};
