// PCM Reception Timeout modal fields and initial state

export const PCM_RECEPTION_TIMEOUT_FIELDS = [
  {
    name: 'interDigitTimeout',
    label: 'Inter Digit Timeout(s)',
    type: 'text',
    placeholder: '4',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'example',
  },
];

export const PCM_RECEPTION_TIMEOUT_INITIAL_FORM = {
  interDigitTimeout: '4',
  description: 'example',
};

export const PCM_RECEPTION_TIMEOUT_TABLE_COLUMNS = [
  { key: 'interDigitTimeout', label: 'Inter Digit Timeout(s)' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];

/** Number-Receiving Timeout (PcmReceptionTimeoutPage) — local React state only */
export const PCM_RECEPTION_TIMEOUT_FIELD_TOOLTIPS = {
  interDigitTimeout:
    "Inter digit timeout in seconds. Stored in local table state. Default: 4.",
  description:
    "Description text. Stored in local table state. Default: example.",
};
