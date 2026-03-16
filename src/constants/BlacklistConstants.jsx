export const BLACKLIST_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  // { key: 'noInGroup', label: 'No. in Group' },
  { key: 'callerId', label: 'CallerID' },
  { key: 'modify', label: 'Modify' },
];

export const BLACKLIST_CALLEE_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupNo', label: 'Group No.' },
  // { key: 'noInGroup', label: 'No. in Group' },
  { key: 'calleeId', label: 'CalleeID' },
  { key: 'modify', label: 'Modify' },
];

export const BLACKLIST_INITIAL_FORM = {
  groupNo: '1',
  noInGroup: '',
  callerId: '',
};

export const BLACKLIST_CALLEE_INITIAL_FORM = {
  groupNo: '1',
  noInGroup: '',
  calleeId: '',
};
