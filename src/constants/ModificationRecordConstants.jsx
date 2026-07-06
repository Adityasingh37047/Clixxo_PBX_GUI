export const MODIFICATION_RECORD_TITLE = 'Modification Record';
export const MODIFICATION_RECORD_CARD_TITLE = MODIFICATION_RECORD_TITLE;

export const MODIFICATION_RECORD_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  MODIFICATION_RECORD_TITLE,
];

export const MODIFICATION_RECORD_BUTTON_LABELS = {
  CHECK: 'Check',
  DOWNLOAD: 'Download',
  LOADING: 'Loading...',
};

export const MODIFICATION_RECORD_BUTTON_VARIANTS = {
  CHECK: 'primary',
  DOWNLOAD: 'cancel',
};

export const MODIFICATION_RECORD_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 10,
  padding: '6px 14px',
};

export const MODIFICATION_RECORD_TEXTAREA_PLACEHOLDER =
  'Click Check to load the latest modification records.';

export const MODIFICATION_RECORD_NOTE =
  'Note: Only the latest 100 pieces of modification record will be displayed. To check all the records, please click the Download button.';

export const MODIFICATION_RECORD_MESSAGES = {
  READ_ERROR: 'Error reading auth.log',
  FETCH_FAILED: 'Error: Failed to fetch auth.log. Please try again.',
  DOWNLOAD_FAILED: 'Error: Failed to download auth.log. Please try again.',
  FILE_EMPTY: 'auth.log file is empty.',
  FILE_UNREADABLE: 'Error: Could not read /var/log/auth.log.',
  FILE_UNREADABLE_OR_EMPTY:
    'Error: Could not read /var/log/auth.log or file is empty.',
};

export const MODIFICATION_RECORD_COMMANDS = {
  FETCH_LATEST: `tail -n 100 /var/log/auth.log 2>/dev/null || echo "${MODIFICATION_RECORD_MESSAGES.READ_ERROR}"`,
  FETCH_ALL: `cat /var/log/auth.log 2>/dev/null || echo "${MODIFICATION_RECORD_MESSAGES.READ_ERROR}"`,
};

export const MODIFICATION_RECORD_TOAST_DEFAULT = {
  msg: '',
  type: 'success',
};

export const MODIFICATION_RECORD_TOAST_DURATION_MS = 5000;
