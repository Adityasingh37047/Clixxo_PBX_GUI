export const ROUTE_PSTN_IP_FIELDS = [
  { key: 'index', label: 'Index', type: 'select' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'sourcePortGroup', label: 'Source Port Group', type: 'select' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix', type: 'text' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix', type: 'text' },
  { key: 'routeSelf', label: 'Route Self', type: 'checkbox' },
  { key: 'destinationAddress', label: 'Destination Address', type: 'text', conditional: 'routeSelf' },
  { key: 'destinationPort', label: 'Destination Port', type: 'text', conditional: 'routeSelf' },
];

export const ROUTE_PSTN_IP_INITIAL_FORM = {
  index: '',
  description: 'default',
  sourcePortGroup: '*',
  callerIdPrefix: '*',
  calleeIdPrefix: '*',
  routeSelf: false,
  destinationAddress: '',
  destinationPort: '5060',
};

export const ROUTE_PSTN_IP_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'description', label: 'Description' },
  { key: 'sourcePortGroup', label: 'Source Port Group' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'destinationAddress', label: 'Destination Address' },
  { key: 'destinationPort', label: 'Destination Port' },
];

const PREFIX_VALIDATION =
  "Cannot contain ~, !, &, |, =, %, (, ), ;, \", ', or \\";

/** FXS Tel->IP routing rule modal */
export const ROUTE_PSTN_IP_FIELD_TOOLTIPS = {
  index:
    "Rule slot 0–63. Required and must be unique among rules.\n" +
    "Saved in local rule state as index.",

  description:
    "Required free-text label. Default: default.\n" +
    PREFIX_VALIDATION,

  sourcePortGroup:
    "Saved as sourcePortGroup. Default: *.\n" +
    "Select a source PCM port group from the loaded list.",

  callerIdPrefix:
    "Saved as callerIdPrefix. Required. Default: *.\n" + PREFIX_VALIDATION,

  calleeIdPrefix:
    "Saved as calleeIdPrefix. Required. Default: *.\n" + PREFIX_VALIDATION,

  destinationAddress:
    "Saved as destinationAddress. Required when routeSelf is false.\n" +
    "Must be a valid IPv4 address (each octet 1–254; first and last octet cannot be 0). " +
    "Cleared when routeSelf is true.",

  destinationPort:
    "Saved as destinationPort. Required when routeSelf is false. Default: 5060.\n" +
    "Stored as 5060 when routeSelf is true.",
};

