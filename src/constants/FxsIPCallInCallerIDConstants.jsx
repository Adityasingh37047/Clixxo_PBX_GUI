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
  { name: 'call_initiator', label: 'Call Initiator:', type: 'text' },
  { name: 'callerid_prefix', label: 'CallerID Prefix:', type: 'text' },
  { name: 'calleeid_prefix', label: 'CalleeID Prefix:', type: 'text' },
  { name: 'stripped_digits_from_left', label: 'Stripped Digits from Left:', type: 'number' },
  { name: 'stripped_digits_from_right', label: 'Stripped Digits from Right:', type: 'number' },
  { name: 'reserved_digits_from_right', label: 'Reserved Digits from Right:', type: 'number' },
  { name: 'prefix_to_add', label: 'Prefix to Add:', type: 'text' },
  { name: 'suffix_to_add', label: 'Suffix to Add:', type: 'text' },
  { name: 'description', label: 'Description:', type: 'text' },
];

// Initial form state for the modal
export const IP_CALL_IN_CALLERID_INITIAL_FORM = {
  call_initiator: '*',
  callerid_prefix: '*',
  calleeid_prefix: '*',
  with_original_calleeid: 'No', // Hidden field required by backend
  stripped_digits_from_left: '0',
  stripped_digits_from_right: '0',
  reserved_digits_from_right: '20',
  prefix_to_add: '',
  suffix_to_add: '',
  description: '',
};

/** FXS IP Call In CallerID (manipulation_type: ip_in_callerid) */
export const IP_CALL_IN_CALLERID_FIELD_TOOLTIPS = {
  call_initiator:
    "Saved as call_initiator. manipulation_type: ip_in_callerid.\n" +
    "Free-text match pattern. Required. Default: *.",

  callerid_prefix:
    "Saved as callerid_prefix. Required text field. Default: *.",

  calleeid_prefix:
    "Saved as calleeid_prefix. Required text field. Default: *.",

  stripped_digits_from_left:
    "Saved as stripped_digits_from_left.\n" +
    "Digits removed from the left before prefix/suffix are applied. Empty value is saved as 0. Default: 0.",

  stripped_digits_from_right:
    "Saved as stripped_digits_from_right.\n" +
    "Digits removed from the right before prefix/suffix are applied. Empty value is saved as 0. Default: 0.",

  reserved_digits_from_right:
    "Saved as reserved_digits_from_right.\n" +
    "Digits kept from the right after stripping. Empty value is saved as 0. Default: 20.",

  prefix_to_add:
    "Saved as prefix_to_add. Prepended after stripping. Default: empty.",

  suffix_to_add:
    "Saved as suffix_to_add. Appended after stripping. Default: empty.",

  description:
    "Saved as description. Free-text field. Default: empty.\n" +
    "with_original_calleeid is not shown in this form; create/update always sends No.",
};

