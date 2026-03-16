export const SIP_TRUNK_GROUP_FIELDS = [
  { name: 'sip_trunk_id', label: 'SIP Trunk ID', type: 'select', options: ['bsnl', 'airtel', 'jio'], defaultValue: '' },
  { name: 'group_id', label: 'Group ID', type: 'text', defaultValue: '' },
];

export const SIP_TRUNK_GROUP_INITIAL_FORM = SIP_TRUNK_GROUP_FIELDS.reduce((acc, field) => {
  if (field.type === 'checkbox') acc[field.name] = [];
  else acc[field.name] = field.defaultValue;
  return acc;
}, {});

export const SIP_TRUNK_GROUP_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'sip_trunk_id', label: 'SIP Trunk ID' },
  { key: 'group_id', label: 'Group ID' },
  { key: 'modify', label: 'Modify' },
];
