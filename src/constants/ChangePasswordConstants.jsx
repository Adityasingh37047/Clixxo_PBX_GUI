export const CHANGE_PASSWORD_FIELDS = [
  { name: 'username',        label: 'Current Username',   type: 'text'     },
  { name: 'newUsername',     label: 'New Username',        type: 'text'     },
  { name: 'password',        label: 'New Password',        type: 'password' },
  { name: 'confirmPassword', label: 'Confirm New Password',type: 'password' },
];

export const CHANGE_PASSWORD_INITIAL_FORM = {
  username:        '',
  newUsername:     '',
  password:        '',
  confirmPassword: '',
};

export const CHANGE_PASSWORD_BUTTONS = {
  save:  'Save',
  reset: 'Reset',
};

export const CHANGE_PASSWORD_NOTE = 'Note: After a successful username change you will be logged out automatically.';
