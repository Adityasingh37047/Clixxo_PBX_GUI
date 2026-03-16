export const ROUTE_IP_PSTN_FIELDS = [
  { key: 'callSource', label: 'Call Source', type: 'select', placeholder: 'Select Sip Trunk Group' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix', type: 'text' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix', type: 'text' },
  { key: 'callDestination', label: 'Call Destination', type: 'select', placeholder: 'Select Pcm Trunk Group' },
  { key: 'numberFilter', label: 'Number Filter', type: 'select', options: ['none'] },
  { key: 'description', label: 'Description', type: 'text' },
];

export const ROUTE_IP_PSTN_INITIAL_FORM = {
  callSource: '',
  callerIdPrefix: '*',
  calleeIdPrefix: '*',
  callDestination: '',
  numberFilter: 'none',
  description: 'default',
};

export const ROUTE_IP_PSTN_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'callSource', label: 'Call Source' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'callDestination', label: 'Call Destination' },
  { key: 'numberFilter', label: 'Number Filter' },
  { key: 'description', label: 'Description' },
];
