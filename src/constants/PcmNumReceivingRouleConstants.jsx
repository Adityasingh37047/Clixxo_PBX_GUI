// Number Receiving Rule modal fields and initial state

export const NUM_RECEIVING_RULE_FIELDS = [
  {
    name: 'number_data',
    label: 'Number Data',
    type: 'text',
    placeholder: 'ex: 982349823',
  },
  {
    name: 'provider',
    label: 'Provider',
    type: 'select',
    options: [
      { value: 'bsnl', label: 'BSNL' },
      { value: 'airtel', label: 'Airtel' },
      { value: 'jio', label: 'Jio' },
      { value: 'vi', label: 'Vi' },
      { value: 'other', label: 'Other' }
    ],
  },
];

export const NUM_RECEIVING_RULE_INITIAL_FORM = {
  number_data: ' ',
  provider: 'bsnl',
};

export const NUM_RECEIVING_RULE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'number_data', label: 'Number Data' },
  { key: 'provider', label: 'Provider' },
  { key: 'modify', label: 'Modify' },
];
