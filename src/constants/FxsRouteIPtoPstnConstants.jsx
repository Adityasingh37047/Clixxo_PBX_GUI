export const ROUTE_IP_PSTN_FIELDS = [
  { key: 'index', label: 'Index', type: 'select' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'sourceIP', label: 'Source IP', type: 'text', showWarning: true },
  { key: 'callerIdPrefix', label: 'CallerID Prefix', type: 'text' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix', type: 'text' },
  { key: 'routeByNumber', label: 'Route by Number', type: 'checkbox' },
  { key: 'callDestination', label: 'Call Destination', type: 'select', conditional: 'routeByNumber' },
];

export const ROUTE_IP_PSTN_INITIAL_FORM = {
  index: '',
  description: 'default',
  sourceIP: '',
  callerIdPrefix: '*',
  calleeIdPrefix: '*',
  routeByNumber: false,
  callDestination: '',
};

export const ROUTE_IP_PSTN_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'description', label: 'Description' },
  { key: 'sourceIP', label: 'Source IP' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'routeByNumber', label: 'Route by Number' },
  { key: 'callDestination', label: 'Call Destination' },
];

const PREFIX_VALIDATION =
  "Cannot contain ~, !, &, |, =, %, (, ), ;, \", ', or \\";

/** FXS IP->Tel routing rule modal */
export const ROUTE_IP_PSTN_FIELD_TOOLTIPS = {
  index:
    "Rule slot 0–63. Required and must be unique among rules.\n" +
    "Saved in local rule state as index.",

  description:
    "Required free-text label. Default: default.\n" +
    PREFIX_VALIDATION,

  sourceIP:
    "Saved as sourceIP. Empty value is stored as *.\n" +
    "* matches any source. When set, must be a valid IPv4 address " +
    "(each octet 1–254; first and last octet cannot be 0).",

  callerIdPrefix:
    "Saved as callerIdPrefix. Required. Default: *.\n" + PREFIX_VALIDATION,

  calleeIdPrefix:
    "Saved as calleeIdPrefix. Required. Default: *.\n" + PREFIX_VALIDATION,

  routeByNumber:
    "Saved as routeByNumber.\n" +
    "When enabled, the rule routes to the selected Call Destination PCM trunk group.",

  callDestination:
    "Saved as callDestination when Route by Number is enabled; otherwise stored as empty.\n" +
    "Required when Route by Number is checked. Select a PCM trunk group from the loaded list.",
};

