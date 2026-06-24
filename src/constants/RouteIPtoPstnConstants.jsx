export const ROUTE_IP_PSTN_FIELDS = [
  {
    key: "callSource",
    label: "Call Source",
    type: "select",
    placeholder: "Select Sip Trunk Group",
  },
  { key: "callerIdPrefix", label: "CallerID Prefix", type: "text" },
  { key: "calleeIdPrefix", label: "CalleeID Prefix", type: "text" },
  {
    key: "callDestination",
    label: "Call Destination",
    type: "select",
    placeholder: "Select Pcm Trunk Group",
  },
  {
    key: "numberFilter",
    label: "Number Filter",
    type: "select",
    options: ["none"],
  },
  { key: "description", label: "Description", type: "text" },
];

export const ROUTE_IP_PSTN_INITIAL_FORM = {
  callSource: "",
  callerIdPrefix: "*",
  calleeIdPrefix: "*",
  callDestination: "",
  numberFilter: "none",
  description: "default",
};

export const ROUTE_IP_PSTN_TABLE_COLUMNS = [
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

/** IP to PSTN (route_type: ip_to_pstn) */
export const ROUTE_IP_PSTN_FIELD_TOOLTIPS = {
  callSource:
    "Saved as call_source.\n" +
    "Select a SIP trunk group from the loaded SIP trunk group list.",

  callerIdPrefix:
    "Saved as caller_id_prefix.\n" + PREFIX_RULES,

  calleeIdPrefix:
    "Saved as callee_id_prefix.\n" + PREFIX_RULES,

  callDestination:
    "Saved as call_destination.\n" +
    "Select a PCM trunk group from the loaded PCM trunk group list.",

  numberFilter:
    "Saved as number_filter.\n" +
    "Only option shown in this UI: none. Default: none.",

  description:
    "Saved as description. Free-text field. Default: default.",
};
