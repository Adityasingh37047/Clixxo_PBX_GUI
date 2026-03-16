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
