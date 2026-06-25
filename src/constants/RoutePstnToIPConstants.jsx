export const ROUTE_PSTN_IP_FIELDS = [
  { key: 'callInitiator', label: 'Call Initiator', type: 'select', placeholder: 'Select PCM Trunk Group' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix', type: 'text' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix', type: 'text' },
  { key: 'callDestination', label: 'Call Destination', type: 'select', placeholder: 'Select SIP Trunk Group' },
  { key: 'numberFilter', label: 'Number Filter', type: 'select', options: ['none'] },
  { key: 'description', label: 'Description', type: 'text' },
];

export const ROUTE_PSTN_IP_INITIAL_FORM = {
  callInitiator: '',
  callerIdPrefix: '*',
  calleeIdPrefix: '*',
  callDestination: '',
  numberFilter: 'none',
  description: 'default',
};

export const ROUTE_PSTN_IP_TABLE_COLUMNS = [
  { key: 'index', label: 'ID' },
  { key: 'callInitiator', label: 'Call Initiator' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'callDestination', label: 'Call Destination' },
  // { key: 'numberFilter', label: 'Number Filter' },
  // { key: 'description', label: 'Description' },
];

const PREFIX_RULES =
  "Only digits (0-9) and * are allowed. Default: *.";

/** PSTN to IP (route_type: pstn_to_ip) */
export const ROUTE_PSTN_IP_FIELD_TOOLTIPS = {
  callInitiator:
    "PCM trunk group where the call originates (saved as call_source).\n" +
    "Required. Options loaded from configured PCM trunk groups.",

  callerIdPrefix:
    "CallerID prefix match for this route (saved as caller_id_prefix).\n" + PREFIX_RULES,

  calleeIdPrefix:
    "CalleeID prefix match for this route (saved as callee_id_prefix).\n" + PREFIX_RULES,

  callDestination:
    "SIP trunk group where the call is sent (saved as call_destination).\n" +
    "Required. Options loaded from configured SIP trunk groups.",

  numberFilter:
    "Number filter applied to this route (saved as number_filter).\n" +
    "Only option in this UI: none. Default: none.",

  description:
    "Optional description for this route (saved as description). Default: default.",
};
