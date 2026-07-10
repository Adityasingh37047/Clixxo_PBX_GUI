export const LICENSE_LIMITS_PAGE_TITLE = 'License Limits';

export const LICENSE_LIMITS_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  LICENSE_LIMITS_PAGE_TITLE,
];

export const LICENSE_LIMITS_CARD_TITLE = LICENSE_LIMITS_PAGE_TITLE;

export const LICENSE_LIMITS_FIELDS = [
  { key: 'max_extensions', label: 'Maximum Extensions' },
  { key: 'max_fxs_ports', label: 'Maximum FXS Port' },
  { key: 'max_trunks', label: 'Maximum Trunks' },
];

export const LICENSE_LIMITS_INITIAL_FORM = {
  max_extensions: '',
  max_fxs_ports: '',
  max_trunks: '',
};

export const LICENSE_LIMITS_TOOLTIPS = {
  max_extensions:
    'The maximum number of extensions allowed for this system.',
  max_fxs_ports: 'The maximum number of FXS ports allowed for this system.',
  max_trunks: 'The maximum number of trunks allowed for this system.',
};

export const LICENSE_LIMITS_BUTTON_LABELS = {
  SAVE: 'Save',
  SAVING: 'Saving...',
};

export const LICENSE_LIMITS_BUTTON_VARIANTS = {
  SAVE: 'primary',
};

export const LICENSE_LIMITS_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const LICENSE_LIMITS_NOTE =
  'Note: Set maximum allowed extensions, FXS ports, and trunks for this system.';

export const LICENSE_LIMITS_MESSAGES = {
  loadFailed: 'Failed to load license limits.',
  saveSuccess: 'License limits saved successfully.',
  saveFailed: 'Failed to save license limits.',
};

export const LICENSE_LIMITS_MESSAGE_DEFAULT = { type: '', text: '' };

export const LICENSE_LIMITS_MESSAGE_TIMEOUT_MS = 4000;
