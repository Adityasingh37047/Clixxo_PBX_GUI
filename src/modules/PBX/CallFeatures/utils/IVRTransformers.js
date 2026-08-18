import { IVR_KEYS, IVR_TEXT_TARGET_TYPES } from "../../../../constants/IVRConstants";

export const TEXT_TARGET_TYPES = new Set(IVR_TEXT_TARGET_TYPES);

export const normalizeGreetShortUi = (v) => {
  if (v == null || v === "") return "Null";
  const s = String(v).trim().toLowerCase();
  if (s === "null") return "Null";
  return String(v);
};

export const buildPromptOptions = (section, fallbackSystem, normalizeValue = (v) => v) => {
  const systemRaw = Array.isArray(section?.system) ? section.system : fallbackSystem;
  const customRaw = Array.isArray(section?.custom) ? section.custom : [];
  const dedupe = (arr) => {
    const seen = new Set();
    return arr.reduce((out, v) => {
      const normalized = normalizeValue(String(v));
      if (!normalized || seen.has(normalized.toLowerCase())) return out;
      seen.add(normalized.toLowerCase());
      out.push(normalized);
      return out;
    }, []);
  };
  return { system: dedupe(systemRaw), custom: dedupe(customRaw) };
};

export const normalizeArrayFromApi = (res) => {
  const root = res?.data ?? res;
  const candidates = [root, root?.message, root?.data, root?.message?.message, root?.message?.data, root?.data?.message, root?.data?.data];
  if (root?.message?.trunks) {
    const trunks = root.message.trunks;
    if (Array.isArray(trunks)) return trunks;
    if (trunks && typeof trunks === "object") return [trunks];
  }
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      for (const key of ["routes", "route_list", "outbound_routes", "outboundRoutes", "options", "list", "items", "result"]) {
        if (Array.isArray(candidate[key])) return candidate[key];
      }
    }
  }
  return [];
};

export const normalizeDestinationOptions = (list) => !Array.isArray(list) ? [] : list.map((item) => {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return { value: String(item), label: String(item) };
  const value = String(item.value ?? item.id ?? item.extension ?? item.ivr_number ?? "").trim();
  const label = String(item.label ?? item.display_name ?? item.name ?? value).trim();
  return value ? { value, label: label || value } : null;
}).filter(Boolean);

/**
 * IVR destination targets only: value = dial number, label = "600 - Name".
 * Other destination types are left unchanged by callers.
 */
export const formatIvrDestinationOptions = (rawList, ivrRows = []) => {
  const nameByNumber = new Map();
  (ivrRows || []).forEach((row) => {
    const num = String(row?.ivrNumber ?? row?.ivr_number ?? "").trim();
    const name = String(row?.name || "").trim();
    if (num) nameByNumber.set(num, name);
  });

  const list = Array.isArray(rawList) ? rawList : [];
  return list
    .map((item) => {
      if (item == null) return null;

      if (typeof item === "string" || typeof item === "number") {
        const value = String(item).trim();
        if (!value) return null;
        const name = nameByNumber.get(value) || "";
        return { value, label: name ? `${value} - ${name}` : value };
      }

      const value = String(
        item.value ?? item.ivr_number ?? item.extension ?? item.id ?? "",
      ).trim();
      if (!value) return null;

      const nameFromItem = String(
        item.label ?? item.display_name ?? item.name ?? "",
      ).trim();
      const name =
        nameByNumber.get(value) ||
        (nameFromItem && nameFromItem !== value ? nameFromItem : "");
      return { value, label: name ? `${value} - ${name}` : value };
    })
    .filter(Boolean);
};

/** Re-apply "number - name" labels onto already-normalized IVR options. */
export const enrichIvrDestinationLabels = (list, ivrRows = []) => {
  const nameByNumber = new Map();
  (ivrRows || []).forEach((row) => {
    const num = String(row?.ivrNumber ?? row?.ivr_number ?? "").trim();
    const name = String(row?.name || "").trim();
    if (num) nameByNumber.set(num, name);
  });

  return (Array.isArray(list) ? list : []).map((item) => {
    const value = String(item?.value ?? "").trim();
    if (!value) return item;
    const existing = String(item?.label || "").trim();
    if (existing.includes(" - ") && existing !== value) return item;
    const name =
      nameByNumber.get(value) ||
      (existing && existing !== value ? existing : "");
    return { ...item, value, label: name ? `${value} - ${name}` : value };
  });
};

export const normalizePromptForApi = (value, defaultKeyword) => {
  if (value == null || value === "") return defaultKeyword;
  return String(value).toLowerCase() === String(defaultKeyword).toLowerCase() ? defaultKeyword : value;
};

const numericIds = (items) => Array.isArray(items) ? items.map(Number).filter(Number.isFinite) : [];

export const transformIvrListItemToRow = (item) => ({
  id: item.id, name: item.name, ivrNumber: item.ivr_number, greetLong: item.greet_long,
  greetShort: normalizeGreetShortUi(item.greet_short), responseTimeout: String(item.response_timeout_ms),
  password: item.password || "", checkVoicemail: item.check_voicemail ? "Enable" : "Disable",
  directOutbound: !!item.direct_outbound, interDigitTimeout: String(item.inter_digit_timeout_ms),
  maxFailures: String(item.max_failures), maxTimeouts: String(item.max_timeouts), digitLength: String(item.digit_length),
  enabled: item.enabled ? "Yes" : "No", directExtension: item.direct_extension ? "Enable" : "Disable",
  fxoFlashTransfer: item.fxo_flash_transfer ? "Enable" : "Disable", invalidSound: item.invalid_sound || "Default",
  exitSound: item.exit_sound || "Default", exitActionType: item.exit_action_type || "",
  exitActionValue: item.exit_action_value || "", ringBack: item.ring_back || "default",
  callerIdNamePrefix: item.callerid_prefix || "", memberOutboundIds: numericIds(item.direct_outbound_routes ?? item.outbound_routes),
});

const blankKeyState = () => Object.fromEntries(IVR_KEYS.map((key) => [key, ""]));

export const mapIvrApiItemToFormState = (item) => {
  const keyDestinations = blankKeyState();
  const keyDestinationValues = blankKeyState();
  const keyActions = Array.isArray(item?.key_actions) ? item.key_actions : Array.isArray(item?.keyActions) ? item.keyActions : [];
  keyActions.forEach((action) => {
    const digit = String(action?.digit ?? "");
    if (keyDestinations[digit] == null) return;
    keyDestinations[digit] = action?.dest_type || "";
    keyDestinationValues[digit] = action?.dest_value != null ? String(action.dest_value) : "";
  });
  return {
    name: item?.name || "", ivrNumber: item?.ivr_number != null ? String(item.ivr_number) : "",
    greetLong: item?.greet_long || "Default", greetShort: normalizeGreetShortUi(item?.greet_short),
    responseTimeout: item?.response_timeout_ms != null ? String(item.response_timeout_ms) : "10000",
    password: item?.password != null ? String(item.password) : "", checkVoicemail: item?.check_voicemail ? "Enable" : "Disable",
    directOutbound: !!item?.direct_outbound, interDigitTimeout: item?.inter_digit_timeout_ms != null ? String(item.inter_digit_timeout_ms) : "3000",
    maxFailures: item?.max_failures != null ? String(item.max_failures) : "3", maxTimeouts: item?.max_timeouts != null ? String(item.max_timeouts) : "3",
    digitLength: item?.digit_length != null ? String(item.digit_length) : "4", enabled: item?.enabled ? "Yes" : "No",
    directExtension: item?.direct_extension ? "Enable" : "Disable", fxoFlashTransfer: item?.fxo_flash_transfer ? "Enable" : "Disable",
    invalidSound: item?.invalid_sound || "Default", exitSound: item?.exit_sound || "Default", exitActionType: item?.exit_action_type || "",
    exitActionValue: item?.exit_action_value || "", ringBack: item?.ring_back || "default", callerIdNamePrefix: item?.callerid_prefix || "",
    selectedOutboundRouteIds: numericIds(item?.direct_outbound_routes), keyDestinations, keyDestinationValues,
  };
};

export const mapIvrRowFallbackToFormState = (row) => ({
  name: row.name || "", ivrNumber: row.ivrNumber || "", greetLong: row.greetLong || "Default",
  greetShort: normalizeGreetShortUi(row.greetShort), responseTimeout: row.responseTimeout || "10000", password: row.password || "",
  checkVoicemail: row.checkVoicemail || "Disable", directOutbound: !!row.directOutbound, interDigitTimeout: row.interDigitTimeout || "3000",
  maxFailures: row.maxFailures || "3", maxTimeouts: row.maxTimeouts || "3", digitLength: row.digitLength || "4", enabled: row.enabled || "Yes",
  directExtension: row.directExtension || "Disable", fxoFlashTransfer: row.fxoFlashTransfer || "Disable", invalidSound: row.invalidSound || "Default",
  exitSound: row.exitSound || "Default", exitActionType: row.exitActionType || "", exitActionValue: row.exitActionValue || "",
  ringBack: row.ringBack || "default", callerIdNamePrefix: row.callerIdNamePrefix || "", selectedOutboundRouteIds: Array.isArray(row.memberOutboundIds) ? [...row.memberOutboundIds] : [],
  keyDestinations: blankKeyState(), keyDestinationValues: blankKeyState(),
});

export const buildKeyActions = (keys, keyDestinations, keyDestinationValues) => {
  const keyActions = [];
  for (const digit of keys) {
    const destType = keyDestinations[digit] || "";
    if (!destType) continue;
    const destValue = String(keyDestinationValues[digit] || "").trim();
    if (destType !== "DialByName" && destType !== "Other" && !destValue) return { keyActions, error: `Select destination for key digit "${digit}".` };
    const action = { digit, dest_type: destType };
    if (destValue) action.dest_value = destValue;
    keyActions.push(action);
  }
  return { keyActions, error: "" };
};

export const buildIvrApiPayload = (fields) => ({
  name: fields.name.trim(), ivr_number: parseInt(fields.ivrNumber.trim(), 10), greet_long: normalizePromptForApi(fields.greetLong, "default"),
  greet_short: String(fields.greetShort).toLowerCase() === "null" ? null : fields.greetShort,
  response_timeout_ms: parseInt(fields.responseTimeout, 10), password: fields.password.trim(), check_voicemail: fields.checkVoicemail === "Enable",
  direct_outbound: !!fields.directOutbound, inter_digit_timeout_ms: parseInt(fields.interDigitTimeout, 10), max_failures: parseInt(fields.maxFailures, 10) || 3,
  max_timeouts: parseInt(fields.maxTimeouts, 10) || 3, digit_length: parseInt(fields.digitLength, 10), enabled: fields.enabled === "Yes",
  direct_extension: fields.directExtension === "Enable", fxo_flash_transfer: fields.fxoFlashTransfer === "Enable",
  invalid_sound: normalizePromptForApi(fields.invalidSound, "default"), exit_sound: normalizePromptForApi(fields.exitSound, "default"),
  ring_back: fields.ringBack, callerid_prefix: fields.callerIdNamePrefix ? fields.callerIdNamePrefix : null,
  exit_action_type: fields.exitActionType || null, exit_action_value: fields.exitActionType ? fields.exitActionValue || null : null,
  direct_outbound_trunk: null, direct_outbound_routes: fields.directOutbound ? fields.selectedOutboundRouteIds : [],
});

export const normalizeOutboundRoutesList = (list) => list.map((route) => ({
  id: Number(route?.id ?? route?.route_id ?? route?.routeId ?? route?.value ?? route?.trunk_id ?? route?.trunkId),
  name: String(route?.name ?? route?.route_name ?? route?.routeName ?? route?.label ?? route?.display_name ?? route?.displayName ?? route?.text ?? route?.value ?? ""),
})).filter((route) => Number.isFinite(route.id)).map((route) => ({ ...route, name: route.name || String(route.id) }));
