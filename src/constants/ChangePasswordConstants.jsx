// Field labels
export const CHANGE_PASSWORD_FIELDS = [
  { name: 'currentUsername', label: 'Current Username', type: 'text' },
  { name: 'currentPassword', label: 'Current Password', type: 'password' },
  { name: 'newUsername', label: 'New Username', type: 'text' },
  { name: 'newPassword', label: 'New Password', type: 'password' },
  { name: 'confirmNewPassword', label: 'Confirm New Password', type: 'password' },
];

// Initial form state
export const CHANGE_PASSWORD_INITIAL_FORM = {
  currentUsername: '',
  currentPassword: '',
  newUsername: '',
  newPassword: '',
  confirmNewPassword: '',
};

// Button labels
export const CHANGE_PASSWORD_BUTTONS = {
  save: 'Save',
  reset: 'Reset',
};

// Red note
export const CHANGE_PASSWORD_NOTE = 'Note1: The username and the password can consist only of numbers, letters or the underline.';
