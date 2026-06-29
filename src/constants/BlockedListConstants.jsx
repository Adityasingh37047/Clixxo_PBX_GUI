export const BLOCKED_LIST_MATCH_MODE_OPTIONS = [
  "Exact Match",
  "Regex Match",
  "Extension",
];

export const BLOCKED_LIST_DIRECTION_OPTIONS = ["Inbound", "Outbound", "Internal"];

export const BLOCKED_LIST_ENABLE_OPTIONS = ["Yes", "No"];

export const BLOCKED_LIST_DEFAULT_MATCH_MODE = "Exact Match";
export const BLOCKED_LIST_DEFAULT_DIRECTION = "Inbound";
export const BLOCKED_LIST_DEFAULT_ENABLED = "Yes";

/** Field tooltips for Blocked List */
export const BLOCKED_LIST_FIELD_TOOLTIPS = {
  name:
    "User-defined name of a blocked list. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_only.",

  match_mode:
    "Select match mode. You can select Exact Match, Regex Match, or Extension. The pattern that selects the exact match number can match the excact number, the pattern that selects the regex match mode can match the regex expression. For example, enter 888*, so can matches anythings starting with 888(include 888).",

  blocked_list_number:
    "Enter or select the blocked list number that will be used to identify and block matching calls.",

  direction:
    "Select the call direction for which the blocked list will be applied, such as inbound, outbound, or both.",

  enabled:
    "Enable or disable this configuration. When enabled, the settings in this section will be applied and become active.",
};
