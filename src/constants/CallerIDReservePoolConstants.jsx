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

/** CallerID Reserve Pool modal — local component state only */
export const CALLERID_RESERVE_POOL_FIELD_TOOLTIPS = {
  no:
    "Sequence number for this reserved CallerID entry.\n" +
    "Required on save. Integer ≥ 0.\n" +
    "Note: save validation treats 0 as empty; use 1 or higher when saving.",
  callerId:
    "Reserved CallerID kept in this pool.\n" +
    "Required on save. Do not change a number while it is assigned (see page note).",
};
