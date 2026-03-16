export const ROUTE_IP_IP_FIELDS = [
  { key: 'index', label: 'Index', type: 'select', options: Array.from({length: 1}, (_, i) => i + 1) },
  { key: 'callSource', label: 'Call Source', type: 'select', options: ['SIP Trunk Group [0]', 'SIP Trunk Group [Any]'] },
  { key: 'callerIdPrefix', label: 'CallerID Prefix', type: 'text' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix', type: 'text' },
  { key: 'callDestination', label: 'Call Destination', type: 'select', options: ['SIP Trunk Group [0]', 'SIP Trunk Group [Any]'] },
  { key: 'numberFilter', label: 'Number Filter', type: 'select', options: ['No'] },
  { key: 'description', label: 'Description', type: 'text' },
];

export const ROUTE_IP_IP_INITIAL_FORM = {
  index: 1,
  callSource: 'SIP Trunk Group [0]',
  callerIdPrefix: '*',
  calleeIdPrefix: '*',
  callDestination: 'SIP Trunk Group [0]',
  numberFilter: 'No',
  description: 'default',
};

export const ROUTE_IP_IP_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'callSource', label: 'Call Source' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'callDestination', label: 'Call Destination' },
  { key: 'numberFilter', label: 'Number Filter' },
  { key: 'description', label: 'Description' },
];
