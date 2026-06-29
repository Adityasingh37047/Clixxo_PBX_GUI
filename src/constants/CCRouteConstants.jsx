export const CC_ROUTE_INTERVAL_OPTIONS = [
  { value: "10", label: "10s" },
  { value: "30", label: "30s" },
  { value: "60", label: "1 min" },
  { value: "120", label: "2 min" },
  { value: "300", label: "5 min" },
];

export const CC_ROUTE_THROUGH_OPTIONS = ["Auto", "From Come In"];

export const CC_ROUTE_RECORD_KEEP_OPTIONS = [
  "8 hours",
  "16 hours",
  "1 day",
  "2 day",
  "3 day",
  "1 week",
  "2 week",
  "3 week",
  "4 week",
];

export const CC_ROUTE_ENABLE_OPTIONS = ["Yes", "No"];

export const CC_ROUTE_KEEP_MINUTES_TO_LABEL = {
  480: "8 hours",
  960: "16 hours",
  1440: "1 day",
  2880: "2 day",
  4320: "3 day",
  10080: "1 week",
  20160: "2 week",
  30240: "3 week",
  40320: "4 week",
};

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
