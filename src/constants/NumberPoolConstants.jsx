export const NUMBER_POOL_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  // { key: 'noInGroup', label: 'No. in Group' },
  { key: 'numberRange', label: 'Number Range' },
  { key: 'modify', label: 'Modify' },
];

export const NUMBER_POOL_GROUPS = Array.from({ length: 200 }, (_, i) => ({
  value: i,
  label: i.toString()
}));
