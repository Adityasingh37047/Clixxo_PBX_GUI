export const CALL_COUNT_TITLE = "Call Count";

export const CALL_COUNT_BREADCRUMB_SEGMENTS = [
  "CDR",
  "Call Detail Records",
  "Call Count",
];

export const CALL_COUNT_ITEMS_PER_PAGE = 50;

export const CALL_COUNT_TABLE_MIN_WIDTH = 1150;

export const CALL_COUNT_COMPACT_MQ = "(max-width: 768px)";

export const CALL_COUNT_EMPTY_MESSAGE = "No call records found.";

export const CALL_COUNT_FILTER_MODAL_TITLE = "Filter Call Count";

export const CALL_COUNT_FOOTER_LIMIT_NOTE = "Only latest 500 records shown";

export const CALL_COUNT_DEFAULT_FILTERS = {
  callStatus: "all",
  direction: "all",
  search: "",
  trunkName: "",
  callFrom: "",
  callTo: "",
  startDate: "",
  endDate: "",
};

export const CALL_COUNT_COLUMNS = [
  { key: "calldate", label: "Start", width: "12%" },
  { key: "src", label: "Call From", width: "8%" },
  { key: "src_ip", label: "Call From IP", width: "10%" },
  { key: "dst", label: "Call To", width: "8%" },
  { key: "dst_ip", label: "Call To IP", width: "10%" },
  { key: "call_direction", label: "Direction", width: "6%", compact: true },
  { key: "disposition", label: "Call Status", width: "8%", compact: true },
  { key: "billsec", label: "Duration", width: "7%", compact: true },
  { key: "dcontext", label: "Context", width: "5%" },
  { key: "hangup_cause", label: "Hangup Cause", width: "13%" },
  { key: "recording", label: "Recording", width: "9%", compact: true },
];

export const CALL_COUNT_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "answered", label: "Answered" },
  { value: "noanswer", label: "No Answer" },
  { value: "voicemail", label: "Voicemail" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
  { value: "ivr", label: "IVR" },
  { value: "call queue", label: "Call Queue" },
  { value: "conference", label: "Conference" },
];

export const CALL_COUNT_DIRECTION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
  { value: "local", label: "Local" },
  { value: "forwarded", label: "Forwarded" },
];

export const CALL_COUNT_TALK_DURATION_OPERATOR_OPTIONS = [
  { value: "<", label: "<" },
  { value: ">", label: ">" },
  { value: "<=", label: "<=" },
  { value: ">=", label: ">=" },
  { value: "=", label: "=" },
];

/** Filter tooltips for Call Count — concise, 1–4 lines */
export const CALL_COUNT_FILTER_TOOLTIPS = {
  call_status:
    "Filter by call result: answered, missed, cancelled, failed, or voicemail.",

  direction: "Filter by call direction: inbound, outbound, or local.",

  call_from: "Search CDR records by caller ID number.",

  call_to: "Search CDR records by final destination number.",

  trunk_name: "Filter by trunk name used for the call.",

  talk_duration:
    "Filter by connected talk time in seconds. Use the operator for greater than,\nless than, or equal.",

  time_range:
    "Limit results to calls between the selected start and end dates.",
};
