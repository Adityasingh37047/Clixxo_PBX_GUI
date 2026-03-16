// Table columns for the main table view
export const VPN_ACCOUNT_TABLE_COLUMNS = [
  { key: 'index', label: 'Index' },
  { key: 'username', label: 'Username' },
  { key: 'password', label: 'Password' },
  { key: 'modify', label: 'Modify' },
];

// Form fields for the modal
export const VPN_ACCOUNT_FIELDS = [
  { name: 'index', label: 'Index:', type: 'number', min: 0 },
  { name: 'username', label: 'Username:', type: 'text' },
  { name: 'password', label: 'Password:', type: 'password' },
];

// Initial form state for the modal
export const VPN_ACCOUNT_INITIAL_FORM = {
  index: 0,
  username: '',
  password: '',
};
