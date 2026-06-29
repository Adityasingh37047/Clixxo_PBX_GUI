export const CDR_QUERY_PAGE_BREADCRUMB_ROOT = "FXS";
export const CDR_QUERY_PAGE_BREADCRUMB_SECTION = "Advanced";
export const CDR_QUERY_PAGE_TITLE = "CDR Query";
export const CDR_QUERY_CARD_TITLE = "CDR Query";
export const CDR_QUERY_BUTTON_LABEL = "Query";

export const CDR_QUERY_INITIAL_FORM = {
  startdate: "",
  enddate: "",
  port: "255",
  billtype: "255",
  callingnum: "",
  callednum: "",
  mintalktime: "",
  maxtalktime: "",
  keyword: "",
};

export const PORT_OPTIONS = [
  { value: "255", label: "All" },
  ...Array.from({ length: 32 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

export const CALL_DIRECTION_OPTIONS = [
  { value: "255", label: "All" },
  { value: "1", label: "InBound" },
  { value: "2", label: "OutBound" },
];

export const CDR_QUERY_FIELDS = [
  { key: "startdate", label: "Starting Date", type: "date" },
  { key: "enddate", label: "Ending Date", type: "date" },
  {
    key: "port",
    label: "Port",
    type: "select",
    options: PORT_OPTIONS,
  },
  {
    key: "billtype",
    label: "Call Direction",
    type: "select",
    options: CALL_DIRECTION_OPTIONS,
  },
  {
    key: "callingnum",
    label: "CallerID",
    type: "text",
    keyPressType: "string",
  },
  {
    key: "callednum",
    label: "CalleeID",
    type: "text",
    keyPressType: "string",
  },
  {
    key: "duration",
    label: "Call Duration(s)",
    type: "duration",
    tooltipKey: "mintalktime",
    minKey: "mintalktime",
    maxKey: "maxtalktime",
  },
  {
    key: "keyword",
    label: "Keyword",
    type: "text",
    keyPressType: "string",
  },
];

/** CDR Query page */
export const CDR_QUERY_FIELD_TOOLTIPS = {
  startdate:
    "Optional start of the CDR date range filter.\n" +
    "State key: startdate. HTML date input.\n" +
    "If both start and end dates are set, start must not be later than end.",

  enddate:
    "Optional end of the CDR date range filter.\n" +
    "State key: enddate. HTML date input.\n" +
    "If both start and end dates are set, end must not be earlier than start.",

  port:
    "FXS port to filter call records.\n" +
    "State key: port. Default: 255 (All).\n" +
    "Options: All (255) or individual ports 1 through 32.",

  billtype:
    "Call direction filter for CDR results.\n" +
    "State key: billtype. Default: 255 (All).\n" +
    "Options: All (255), InBound (1), OutBound (2).",

  callingnum:
    "Optional caller ID filter.\n" +
    "State key: callingnum. Free text; allowed characters: letters, digits, space, period (.), underscore (_).\n" +
    "Empty matches all callers.",

  callednum:
    "Optional callee ID filter.\n" +
    "State key: callednum. Free text; allowed characters: letters, digits, space, period (.), underscore (_).\n" +
    "Empty matches all callees.",

  mintalktime:
    "Optional call-duration range filter in seconds (min — max).\n" +
    "State keys: mintalktime (minimum) and maxtalktime (maximum). Digits only.\n" +
    "If both bounds are set, minimum must not exceed maximum.",

  maxtalktime:
    "Optional maximum call duration in seconds.\n" +
    "State key: maxtalktime. Digits only.\n" +
    "Used with mintalktime: if both are set, max must not be less than min.",

  keyword:
    "Optional keyword search across CDR records.\n" +
    "State key: keyword. Free text; allowed characters: letters, digits, space, period (.), underscore (_).\n" +
    "Empty disables keyword filtering.",
};
