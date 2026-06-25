// Table columns for Calling/Called Party Number Type
export const NUMBER_TYPE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'no', label: 'No.' },
  { key: 'callerIdPrefix', label: 'CallerID Prefix' },
  { key: 'calleeIdPrefix', label: 'CalleeID Prefix' },
  { key: 'type', label: 'Type' },
  { key: 'setRedirecting', label: 'Set if Redirecting Number Available' },
  { key: 'modify', label: 'Modify' },
];

// Number type options for the select dropdown
export const NUMBER_TYPE_OPTIONS = [
  { value: 'national', label: 'National number(0X21)' },
  { value: 'international', label: 'International number(0X11)' },
  { value: 'network', label: 'Network number(0X31)' },
  { value: 'subscriber', label: 'Subscriber number(0X41)' },
  { value: 'unknown', label: 'Unknown(0X01)' },
];

// Modal form fields
export const NUMBER_TYPE_MODAL_FIELDS = [
  { name: 'no', label: 'No.:', type: 'number', defaultValue: 0 },
  { name: 'callerIdPrefix', label: 'CallerID Prefix:', type: 'text', defaultValue: '' },
  { name: 'calleeIdPrefix', label: 'CalleeID Prefix:', type: 'text', defaultValue: '' },
  { name: 'type', label: 'Type:', type: 'select', options: NUMBER_TYPE_OPTIONS, defaultValue: 'national' },
  { name: 'setRedirecting', label: 'Set if Redirecting Number Available', type: 'checkbox'},
];

// Initial form state
export const NUMBER_TYPE_MODAL_INITIAL_FORM = NUMBER_TYPE_MODAL_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});
