// Table columns for the main table view
export const CALLERID_RESERVE_POOL_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'no', label: 'No.' },
  { key: 'callerId', label: 'CallerID' },
  { key: 'modify', label: 'Modify' },
];

// Form fields for the modal
export const CALLERID_RESERVE_POOL_FIELDS = [
  { name: 'no', label: 'No.:', type: 'number', min: 0 },
  { name: 'callerId', label: 'CallerID:', type: 'text' },
];

// Initial form state for the modal
export const CALLERID_RESERVE_POOL_INITIAL_FORM = {
  no: 0,
  callerId: '',
};
