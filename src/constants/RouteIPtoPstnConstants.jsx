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

export const ROUTE_IP_PSTN_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const ROUTE_IP_PSTN_PAGE_BREADCRUMB_SECTION = "Route";
export const ROUTE_IP_PSTN_PAGE_TITLE = "IP->PSTN Routing Rule";
export const ROUTE_IP_PSTN_EMPTY_MESSAGE = "No rules configured!";
export const ROUTE_IP_PSTN_MODAL_TITLE_ADD = "Add IP->PSTN Routing Rule";
export const ROUTE_IP_PSTN_MODAL_TITLE_EDIT = "Edit IP->PSTN Routing Rule";
export const ROUTE_IP_PSTN_ADD_NEW_LABEL = "+ Add New";
export const ROUTE_IP_PSTN_ADD_NEW_EMPTY_LABEL = "+ Add New Rule";
export const ROUTE_IP_PSTN_SAVE_LABEL = "Save";
export const ROUTE_IP_PSTN_CLOSE_LABEL = "Close";

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
    "SIP trunk group where the call originates (saved as call_source).\n" +
    "Required. Options loaded from configured SIP trunk groups.",

  callerIdPrefix:
    "CallerID prefix match for this route (saved as caller_id_prefix).\n" + PREFIX_RULES,

  calleeIdPrefix:
    "CalleeID prefix match for this route (saved as callee_id_prefix).\n" + PREFIX_RULES,

  callDestination:
    "PCM trunk group where the call is sent (saved as call_destination).\n" +
    "Required. Options loaded from configured PCM trunk groups.",

  numberFilter:
    "Number filter applied to this route (saved as number_filter).\n" +
    "Only option in this UI: none. Default: none.",

  description:
    "Optional description for this route (saved as description). Default: default.",
};
