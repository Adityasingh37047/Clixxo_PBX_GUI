export const NUMBER_FILTER_POOL_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  { key: 'numberRange', label: 'Number Range' },
  { key: 'modify', label: 'Modify' },
];

export const NUMBER_FILTER_POOL_GROUPS = Array.from({ length: 200 }, (_, i) => ({
  value: i,
  label: i.toString(),
}));

export const NUMBER_FILTER_POOL_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const NUMBER_FILTER_POOL_PAGE_BREADCRUMB_SECTION = "Number Filter";
export const NUMBER_FILTER_POOL_PAGE_TITLE = "Number Pool";
export const NUMBER_FILTER_POOL_EMPTY_MESSAGE = "No number pool entries found.";
export const NUMBER_FILTER_POOL_MODAL_TITLE_ADD = "Add Number Pool Entry";
export const NUMBER_FILTER_POOL_MODAL_TITLE_EDIT = "Edit Number Pool Entry";
export const NUMBER_FILTER_POOL_ADD_NEW_LABEL = "+ Add New";
export const NUMBER_FILTER_POOL_ADD_NEW_EMPTY_LABEL = "+ Add New";
export const NUMBER_FILTER_POOL_DELETE_LABEL = "Delete";
export const NUMBER_FILTER_POOL_CLEAR_ALL_LABEL = "Clear All";
export const NUMBER_FILTER_POOL_SAVE_LABEL = "Save";
export const NUMBER_FILTER_POOL_CLOSE_LABEL = "Close";

/** Number Pool modal */
export const NUMBER_FILTER_POOL_FIELD_TOOLTIPS = {
  groupNo:
    "Saved as group.\n" +
    "Dropdown options: 0 to 199. Default on add: 0.\n" +
    "no_in_groups is set to the current entry count in the selected group.",

  range:
    "Saved as number_range in start-end format.\n" +
    "Start and End are both required.\n" +
    "UI validates equal digit length and Start ≤ End.",
};
