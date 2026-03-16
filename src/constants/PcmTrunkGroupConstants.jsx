// PCM Trunk Group modal fields and initial state

export const PCM_TRUNK_GROUP_FIELDS = [
  {
    name: 'groupId',
    label: 'Group ID',
    type: 'select',
    options: Array.from({ length: 256 }, (_, i) => ({ value: i, label: i.toString() })),
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Testing',
  },
  // PSTN IDs handled separately as checkboxes
];

export const PCM_TRUNK_GROUP_INITIAL_FORM = {
  groupId: 0,
  description: 'Testing',
  pstnIds: [], // from spans
};

export const PCM_TRUNK_GROUP_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupId', label: 'Group ID' },
  { key: 'pstnIds', label: 'PSTN IDs' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];
