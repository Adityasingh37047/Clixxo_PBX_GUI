// Table columns for the main table view
export const TONE_DETECTER_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify' },
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'tone', label: 'Tone' },
  { key: 'first_mid_frequency', label: 'The 1st Mid-frequency' },
  { key: 'second_mid_frequency', label: 'The 2nd Mid-frequency' },
  { key: 'duration_on_state', label: 'Duration at ON State' },
  { key: 'duration_off_state', label: 'Duration at OFF State' },
  { key: 'period_count', label: 'Period Count' },
  { key: 'duration_error', label: 'Duration Error at ON/OFF State(ms)' },
];

// Form fields for the modal
export const TONE_DETECTER_FIELDS = [
  { name: 'index', label: 'Index:', type: 'number' },
  { name: 'tone', label: 'Tone:', type: 'select', options: [
    { value: 'Dial Tone', label: 'Dial Tone' },
    { value: 'Busy Tone', label: 'Busy Tone' },
    { value: 'Ringback Tone', label: 'Ringback Tone' },
    { value: 'Fax F1', label: 'Fax F1' },
    { value: 'Fax F2', label: 'Fax F2' },
  ] },
  { name: 'first_mid_frequency', label: 'The 1st Mid-frequency:', type: 'number' },
  { name: 'second_mid_frequency', label: 'The 2nd Mid-frequency:', type: 'number' },
  { name: 'duration_on_state', label: 'Duration at ON State:', type: 'number' },
  { name: 'duration_off_state', label: 'Duration at OFF State:', type: 'number' },
  { name: 'period_count', label: 'Period Count:', type: 'number' },
  { name: 'duration_error', label: 'Duration Error at ON/OFF State(ms):', type: 'number' },
];

// Initial form state for the modal
export const TONE_DETECTER_INITIAL_FORM = {
  index: 0,
  tone: 'Dial Tone',
  first_mid_frequency: '450',
  second_mid_frequency: '0',
  duration_on_state: '1500',
  duration_off_state: '0',
  period_count: '0',
  duration_error: '20',
};


