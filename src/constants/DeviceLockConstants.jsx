export const DEVICE_LOCK_OPTIONS = [
  { label: 'IP', value: 'ip' },
  { label: 'SIP Trunk', value: 'sipTrunk' },
  { label: 'Protocol', value: 'protocol' },
];

export const DEVICE_LOCK_PAGE_TITLE = 'Device Lock';

export const DEVICE_LOCK_LABELS = {
  instruction:
    'Please select the condition to lock the device (Note: You are required to input the password before you modify any configuration of the selected items.)',
  password: 'Password',
  confirmPassword: 'Confirm Password',
};

export const DEVICE_LOCK_BUTTON_LABELS = {
  LOCK: 'Lock',
  RESET: 'Reset',
};

export const DEVICE_LOCK_BUTTON_VARIANTS = {
  LOCK: 'primary',
  RESET: 'cancel',
};

export const DEVICE_LOCK_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const DEVICE_LOCK_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  DEVICE_LOCK_PAGE_TITLE,
];

export const DEVICE_LOCK_MESSAGES = {
  passwordRequired: 'Please fill out both password fields.',
  passwordMismatch: 'Passwords do not match.',
  lockSuccess: 'Device locked successfully!',
};

export const DEVICE_LOCK_DEFAULT_TOAST = {
  msg: '',
  type: 'success',
};

export const DEVICE_LOCK_TOAST_DURATION_MS = 3500;

export const DEVICE_LOCK_ERROR_HIDE_MS = 5000;
