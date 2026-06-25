// Table columns for the main table view
export const IP_CALL_IN_CALLERID_TABLE_COLUMNS = [
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
export const IP_CALL_IN_CALLERID_FIELDS = [
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
export const IP_CALL_IN_CALLERID_INITIAL_FORM = {
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

const PREFIX_MATCH =
  "Match pattern for this leg. Only digits (0-9) and * are allowed. Default: *.";

/** IP Call In CallerID (manipulation_type: ip_in_callerid) */
export const IP_CALL_IN_CALLERID_FIELD_TOOLTIPS = {
  call_initiator:
    "SIP trunk group for this rule (saved as call_initiator).\n" +
    "Applies to inbound IP calls on the selected trunk when CallerID and CalleeID prefixes match.\n" +
    "Required. Options loaded from configured SIP trunk groups.",

  callerid_prefix:
    "Incoming CallerID match pattern (saved as callerid_prefix).\n" +
    PREFIX_MATCH + "\nRequired.",

  calleeid_prefix:
    "Incoming CalleeID match pattern (saved as calleeid_prefix).\n" +
    PREFIX_MATCH + "\nRequired.",

  with_original_calleeid:
    "Whether the original callee ID is kept (saved as with_original_calleeid).\n" +
    "Options: Yes, No. Default: No. Required.",

  stripped_digits_from_left:
    "Digits removed from the left before prefix/suffix are applied (saved as stripped_digits_from_left).\n" +
    "Empty value is saved as 0. Default: 0.",

  stripped_digits_from_right:
    "Digits removed from the right before prefix/suffix are applied (saved as stripped_digits_from_right).\n" +
    "Empty value is saved as 0. Default: 0.",

  reserved_digits_from_right:
    "Digits kept from the right after stripping (saved as reserved_digits_from_right).\n" +
    "Empty value is saved as 0. Default: 20.",

  prefix_to_add:
    "Text prepended to the number after stripping (saved as prefix_to_add). Default: empty.",

  suffix_to_add:
    "Text appended to the number after stripping (saved as suffix_to_add). Default: empty.",

  description:
    "Optional label for this rule (saved as description). Default: empty.",
};
