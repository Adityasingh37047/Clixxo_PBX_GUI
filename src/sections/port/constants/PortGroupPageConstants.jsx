// Port Group page constants

export const PORT_GROUP_TOTAL_PORTS = 32;

export const PORT_GROUP_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify' },
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'description', label: 'Description' },
  { key: 'sipAccount', label: 'SIP Account' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'ports', label: 'Ports' },
  { key: 'portSelectMode', label: 'Port Select Mode' },
  { key: 'enumRule', label: 'Rule for Ringing by Turns' },
  { key: 'ringExpire', label: 'Timeout for Ringing by Turns (s)' },
  { key: 'robKey', label: 'Preemptive Answer Keyboard Shortcut' },
];

export const PORT_GROUP_INDEX_OPTIONS = Array.from({ length: 32 }, (_, i) =>
  String(i + 1),
);

export const PORT_GROUP_REGISTER_OPTIONS = [
  { value: '0', label: 'NO' },
  { value: '1', label: 'YES' },
];

export const PORT_GROUP_AUTHENTICATION_MODE_OPTIONS = [
  { value: '0', label: 'Do Not Register' },
  { value: '3', label: 'Register Port' },
  { value: '2', label: 'Register Port Group' },
  { value: '1', label: 'Register Gateway' },
];

export const PORT_GROUP_SELECT_MODE_OPTIONS = [
  { value: '0', label: 'Increase' },
  { value: '1', label: 'Decrease' },
  { value: '2', label: 'Cyclic Increase' },
  { value: '3', label: 'Cyclic Decrease' },
  { value: '4', label: 'Group Ringing' },
  { value: '5', label: 'Ringing by Turns' },
];

export const PORT_GROUP_MULTI_GROUP_OPTIONS = [
  { value: '0', label: 'NO' },
  { value: '1', label: 'YES' },
];

export const PORT_GROUP_PAGE_TITLE = 'Port Group Settings';
export const PORT_GROUP_ADD_TITLE = 'Port Group-Add';


