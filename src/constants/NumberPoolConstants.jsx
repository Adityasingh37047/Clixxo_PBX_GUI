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

/** Number Pool modal */
export const NUMBER_POOL_FIELD_TOOLTIPS = {
  groupNo:
    "Saved as group.\n" +
    "Dropdown options: 0 to 199. Default on add: 0.\n" +
    "no_in_groups is set to the current entry count in the selected group.",

  range:
    "Saved as number_range in start-end format.\n" +
    "Start and End are both required.\n" +
    "UI validates equal digit length and Start ≤ End.",
};
