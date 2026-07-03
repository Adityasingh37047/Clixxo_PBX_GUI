export const DEVICE_LOCK_OPTIONS = [
  { label: 'IP', value: 'ip' },
  { label: 'SIP Trunk', value: 'sipTrunk' },
  { label: 'Protocol', value: 'protocol' },
];

export const DEVICE_LOCK_LABELS = {
  title: 'Device Lock',
  instruction: 'Please select the condition to lock the device (Note: You are required to input the password before you modify any configuration of the selected items.)',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  lock: 'Lock',
  reset: 'Reset',
};

export const DEVICE_LOCK_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  DEVICE_LOCK_LABELS.title,
];

export const DEVICE_LOCK_MESSAGES = {
  passwordRequired: "Please fill out both password fields.",
  passwordMismatch: "Passwords do not match.",
  lockSuccess: "Device locked successfully!",
};

export const DEVICE_LOCK_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const DEVICE_LOCK_TOAST_DURATION = 3500;

export const DEVICE_LOCK_ERROR_HIDE_MS = 5000;
