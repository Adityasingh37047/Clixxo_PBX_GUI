export const WHITELIST_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  // { key: 'noInGroup', label: 'No. in Group' },
  { key: 'callerId', label: 'CallerID' },
  { key: 'modify', label: 'Modify' },
];

export const WHITELIST_CALLEE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  // { key: 'noInGroup', label: 'No. in Group' },
  { key: 'calleeId', label: 'CalleeID' },
  { key: 'modify', label: 'Modify' },
];

export const WHITELIST_INITIAL_FORM = {
  groupNo: '',
  noInGroup: '',
  callerId: '',
};

export const WHITELIST_CALLEE_INITIAL_FORM = {
  groupNo: '',
  noInGroup: '',
  calleeId: '',
};
