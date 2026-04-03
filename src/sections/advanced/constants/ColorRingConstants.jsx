// Table columns for the main table view
export const COLOR_RING_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify' },
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'description', label: 'Description' },
  { key: 'fileName', label: 'Color Ring' },
];

// Index options (1-32)
export const COLOR_RING_INDEX_OPTIONS = Array.from({ length: 32 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

// Initial form state for the upload form
export const COLOR_RING_INITIAL_FORM = {
  index: '1',
  description: 'default',
  file: null,
};


