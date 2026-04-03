// Table columns for the main table view
export const DIALING_TIMEOUT_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify' },
  { key: 'interDigitTimeout', label: 'Inter Digit Timeout (s)' },
  { key: 'offHookTimeout', label: 'Off-hook Waiting Keypress Timeout(s)' },
  { key: 'description', label: 'Description' },
];

// Initial form state for the modal
export const DIALING_TIMEOUT_INITIAL_FORM = {
  interDigitTimeout: '6',
  offHookTimeout: '6',
  description: 'example',
};

// Initial data (single row)
export const DIALING_TIMEOUT_INITIAL_DATA = {
  id: 1,
  interDigitTimeout: 6,
  offHookTimeout: 6,
  description: 'example',
};


