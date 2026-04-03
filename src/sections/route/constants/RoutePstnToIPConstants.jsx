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

