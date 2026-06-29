export const OUTBOUND_RESTRICTION_ENABLE_OPTIONS = ["Yes", "No"];

/** Field tooltips for Outbound Restrictions — concise, 1–4 lines */
export const OUTBOUND_RESTRICTION_FIELD_TOOLTIPS = {
  name:
    "User-defined restriction name. Required — the rule cannot be saved without it.",

  calls_limit:
    "Maximum outbound calls allowed within the Time Limit window.\nExample: 5 calls in 5 minutes — the 6th call is blocked.",

  time_limit:
    "Time window for counting outbound calls. Default: 5 minutes.",

  auto_cancel_restriction:
    "Yes — the lock clears after the time limit and calls resume automatically.\nNo — the extension stays locked until manually unlocked.",

  enabled: "Enable or disable this restriction rule. Default: Yes.",

  member_extensions:
    "Extensions subject to this call-limit rule. At least one extension is required.",
};
