/** Shared regex help for DID / Caller ID pattern fields */
const INBOUND_NUMBER_PATTERN_TOOLTIP =
  "Regular expression to match incoming numbers.\n" +
  "\"^\" / \"$\" — start/end; \"|\" — OR; \"[]\" — digit range; \"\\d\" — any digit 0-9.\n" +
  "\"+\" — one or more digits; \"*\" — zero or more; \"{n}\" — repeat count; \"()\" — grouping.\n" +
  "Examples: ^123$ (exact), ^123|456$ (either), ^602\\d{7}$ (602 + 7 digits).";

/** Field tooltips for Inbound Routes — concise, 1–4 lines */
export const INBOUND_ROUTE_FIELD_TOOLTIPS = {
  name:
    "User-defined route name. Required — the route cannot be saved without it.",

  did_pattern: INBOUND_NUMBER_PATTERN_TOOLTIP,

  caller_id_pattern: INBOUND_NUMBER_PATTERN_TOOLTIP,

  distinctive_ringtone:
    "Send INVITE with Alert-Info so the called extension can select a custom ring tone (e.g. Family). Default: null.",

  enable_t38: "Enable T.38 fax support on this route. Default: No.",

  destination:
    "Where matched calls are sent (extension, IVR, queue, etc.). Required.",

  destination_value:
    "Select the specific target for the chosen destination type. Required.",

  extension_range:
    "Extension number range when Destination is Extension_Range (e.g. 100-136). Required.",

  enabled: "Enable or disable this route. Default: Yes.",

  priority:
    "Matching order — lower values have higher priority. Default: 100.",

  enable_mobility_extension:
    "When Yes, the user's mobile number has the same permissions as their desk extension — call other extensions, dial out via trunk, and access voicemail.",

  send_ringtone:
    "Local: PBX plays ringback to the caller.\n" +
    "Remote: Pass through extension 180/183 ringback. Default: Remote.",

  enable_time_condition:
    "When Yes, route calls to different destinations by time schedule; calls outside set periods go to Other Time destination. Each time condition has a feature code to override routing.\n" +
    "When No, all calls go to the main Destination.",

  member_trunks:
    "Trunks permitted to use this route. At least one trunk is required.",
};
