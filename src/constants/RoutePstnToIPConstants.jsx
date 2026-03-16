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
  { key: 'index', label: 'Index' },
  { key: 'callInitiator', label: 'Call Initiator' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'callDestination', label: 'Call Destination' },
  { key: 'numberFilter', label: 'Number Filter' },
  { key: 'description', label: 'Description' },
];
