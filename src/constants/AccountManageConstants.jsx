// Table columns for Account Manage
export const ACCOUNT_MANAGE_TABLE_COLUMNS = [
  { key: 'choose', label: 'Choose' },
  { key: 'id', label: 'Id' },
  { key: 'username', label: 'Username' },
  { key: 'permission', label: 'Permission' },
  { key: 'modify', label: 'Modify' },
];

// Modal fields for user info
export const ACCOUNT_MANAGE_MODAL_FIELDS = [
  { name: 'index', label: 'Index', type: 'text', disabled: true },
  { name: 'userName', label: 'User Name', type: 'text' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'authority', label: 'Authority', type: 'multiSelect', options: [ { value: 'Read', label: 'Read' }, { value: 'Write', label: 'Write' } ] },
];

// Initial form state
export const ACCOUNT_MANAGE_INITIAL_FORM = {
  index: '',
  userName: '',
  password: '',
  authority: ['Read'],
};

// Button labels
export const ACCOUNT_MANAGE_BUTTONS = {
  addNew: 'Add New',
  save: 'Save',
  close: 'Close',
  checkAll: 'CheckAll',
  uncheckAll: 'UncheckAll',
  inverse: 'Inverse',
  delete: 'Delete',
  clearAll: 'ClearAll',
};
