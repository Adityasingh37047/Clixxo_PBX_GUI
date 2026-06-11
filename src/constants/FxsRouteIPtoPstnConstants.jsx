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

