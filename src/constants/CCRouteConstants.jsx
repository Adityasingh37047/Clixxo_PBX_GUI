/** Field tooltips for CC Route — keep to ~3 lines max */
export const CC_ROUTE_FIELD_TOOLTIPS = {
  cc_interval_time:
    "The callback interval for calls in the CC record. Default: 1 minute.",

  through:
    "Select the callback through type.\n" +
    "Auto: The system chooses the outbound path.\n" +
    "From Come In: Outbound uses the trunk the call arrived on.",

  record_keep_time:
    "The time to keep a CC record. Default: 8 hours.",

  enable: "Set whether to enable the CC route. Default: No.",

  member_extensions:
    "Extensions authorized to control CC routes.",
};
