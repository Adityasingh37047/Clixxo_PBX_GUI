// Table columns for the main table view
export const IP_CALL_IN_CALLEEID_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'call_initiator', label: 'Call Initiator' },
  { key: 'callerid_prefix', label: 'CallerID Prefix' },
  { key: 'calleeid_prefix', label: 'CalleeID Prefix' },
  { key: 'with_original_calleeid', label: 'With Original CalleeID' },
  { key: 'stripped_digits_from_left', label: 'Stripped Digits from Left' },
  { key: 'stripped_digits_from_right', label: 'Stripped Digits from Right' },
  { key: 'reserved_digits_from_right', label: 'Reserved Digits from Right' },
  { key: 'prefix_to_add', label: 'Prefix to Add' },
  { key: 'suffix_to_add', label: 'Suffix to Add' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];

// Form fields for the modal
export const IP_CALL_IN_CALLEEID_FIELDS = [
  { name: 'call_initiator', label: 'Call Initiator:', type: 'select', options: [] }, // Will be populated dynamically with SIP trunk groups
  { name: 'callerid_prefix', label: 'CallerID Prefix:', type: 'text' },
  { name: 'calleeid_prefix', label: 'CalleeID Prefix:', type: 'text' },
  { name: 'with_original_calleeid', label: 'With Original CalleeID:', type: 'select', options: [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ] },
  { name: 'stripped_digits_from_left', label: 'Stripped Digits from Left:', type: 'number' },
  { name: 'stripped_digits_from_right', label: 'Stripped Digits from Right:', type: 'number' },
  { name: 'reserved_digits_from_right', label: 'Reserved Digits from Right:', type: 'number' },
  { name: 'prefix_to_add', label: 'Prefix to Add:', type: 'text' },
  { name: 'suffix_to_add', label: 'Suffix to Add:', type: 'text' },
  { name: 'description', label: 'Description:', type: 'text' },
];

// Initial form state for the modal
export const IP_CALL_IN_CALLEEID_INITIAL_FORM = {
  call_initiator: '', // Will be set dynamically to first SIP trunk group
  callerid_prefix: '*',
  calleeid_prefix: '*',
  with_original_calleeid: 'No', // Default to "No"
  stripped_digits_from_left: '0',
  stripped_digits_from_right: '0',
  reserved_digits_from_right: '20',
  prefix_to_add: '',
  suffix_to_add: '',
  description: '',
};