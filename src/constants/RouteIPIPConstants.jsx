export const ROUTE_IP_IP_FIELDS = [
  {
    key: "index",
    label: "ID",
    type: "select",
    options: Array.from({ length: 1 }, (_, i) => i + 1),
  },
  {
    key: "callSource",
    label: "Call Source",
    type: "select",
    options: ["SIP Trunk Group [0]", "SIP Trunk Group [Any]"],
  },
  { key: "callerIdPrefix", label: "CallerID Prefix", type: "text" },
  { key: "calleeIdPrefix", label: "CalleeID Prefix", type: "text" },
  {
    key: "callDestination",
    label: "Call Destination",
    type: "select",
    options: ["SIP Trunk Group [0]", "SIP Trunk Group [Any]"],
  },
  {
    key: "numberFilter",
    label: "Number Filter",
    type: "select",
    options: ["No"],
  },
  { key: "description", label: "Description", type: "text" },
];

export const ROUTE_IP_IP_INITIAL_FORM = {
  index: 1,
  callSource: "SIP Trunk Group [0]",
  callerIdPrefix: "*",
  calleeIdPrefix: "*",
  callDestination: "SIP Trunk Group [0]",
  numberFilter: "No",
  description: "default",
};

export const ROUTE_IP_IP_TABLE_COLUMNS = [
  { key: "index", label: "ID" },
  { key: "callSource", label: "Call Source" },
  { key: "callerIdPrefix", label: "CallerID Prefix" },
  { key: "calleeIdPrefix", label: "CalleeID Prefix" },
  { key: "callDestination", label: "Call Destination" },
  // { key: "numberFilter", label: "Number Filter" },
  // { key: "description", label: "Description" },
];

const PREFIX_RULES =
  "Only digits (0-9) and * are allowed. Default: *.";

/** IP to IP (route_type: ip_to_ip) */
export const ROUTE_IP_IP_FIELD_TOOLTIPS = {
  index:
    "Table ID column shows the row number.\n" +
    "This form field is not sent when the route is saved.",

  callSource:
    "Saved as call_source.\n" +
    "SIP trunk group from the loaded list. Cannot be the same as Call Destination.",

  callerIdPrefix:
    "Saved as caller_id_prefix.\n" + PREFIX_RULES,

  calleeIdPrefix:
    "Saved as callee_id_prefix.\n" + PREFIX_RULES,

  callDestination:
    "Saved as call_destination.\n" +
    "SIP trunk group from the loaded list. Cannot be the same as Call Source.",

  numberFilter:
    "Saved as number_filter.\n" +
    "Only option shown in this UI: No. Default: No.",

  description:
    "Saved as description. Free-text field. Default: default.",
};
