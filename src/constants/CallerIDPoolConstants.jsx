// Table columns for CallerID Pool
export const CALLERID_POOL_TABLE_COLUMNS = [
  { key: 'check', label: 'Check', width: 50 },
  { key: 'no', label: 'No.', width: 35},
  { key: 'callerIdRange', label: 'CallerID Range', width: 75},
  { key: 'outgoingCallResource', label: 'Outgoing Call Resource', width: 100 },
  { key: 'destinationPcm', label: 'Destination PCM', width: 90 },
  { key: 'modify', label: 'Modify', width: 50 },
];

// Modal fields for Add/Edit CallerID Pool
export const CALLERID_POOL_MODAL_FIELDS = [
  { key: 'no', label: 'No.', type: 'number', required: true },
  { key: 'outgoingCallResource', label: 'Outgoing Call Resource', type: 'text', required: true },
  { key: 'destinationPcm', label: 'Destination PCM', type: 'select', required: true, options: ['Any', 'PCM'] },
  { key: 'callerIdRange', label: 'CallerID Range', type: 'text', required: true },
];

// Initial form state for modal
export const CALLERID_POOL_INITIAL_FORM = {
  no: '',
  outgoingCallResource: '',
  destinationPcm: 'Any',
  callerIdRange: '',
};
