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
    "Display-only row identifier in the form.\n" +
    "The table ID column shows the row number; this field is not sent when the route is saved.",

  callSource:
    "SIP trunk group where the call originates (saved as call_source).\n" +
    "Options loaded from configured SIP trunk groups. Cannot be the same as Call Destination.",

  callerIdPrefix:
    "CallerID prefix match for this route (saved as caller_id_prefix).\n" + PREFIX_RULES,

  calleeIdPrefix:
    "CalleeID prefix match for this route (saved as callee_id_prefix).\n" + PREFIX_RULES,

  callDestination:
    "SIP trunk group where the call is sent (saved as call_destination).\n" +
    "Options loaded from configured SIP trunk groups. Cannot be the same as Call Source.",

  numberFilter:
    "Number filter applied to this route (saved as number_filter).\n" +
    "Only option in this UI: No. Default: No.",

  description:
    "Optional description for this route (saved as description). Default: default.",
};
