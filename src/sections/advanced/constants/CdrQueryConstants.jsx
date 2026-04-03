// Initial form data for CDR Query page
export const CDR_QUERY_INITIAL_FORM = {
  startdate: '',
  enddate: '',
  port: '255', // All
  billtype: '255', // All
  callingnum: '',
  callednum: '',
  mintalktime: '',
  maxtalktime: '',
  keyword: '',
};

// Port options (All + 1-32)
export const PORT_OPTIONS = [
  { value: '255', label: 'All' },
  ...Array.from({ length: 32 }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  })),
];

// Call Direction options
export const CALL_DIRECTION_OPTIONS = [
  { value: '255', label: 'All' },
  { value: '1', label: 'InBound' },
  { value: '2', label: 'OutBound' },
];


