export const BACKUP_UPLOAD_PAGE_TITLE = 'Backup & Upload';

export const BACKUP_UPLOAD_TITLES = {
  BACKUP: 'Full System Backup',
  UPLOAD: 'Restore Backup',
};

export const BACKUP_UPLOAD_LABELS = {
  BACKUP_INSTRUCTION:
    'Download a complete server backup as a .tar archive.',
  UPLOAD_INSTRUCTION:
    "Select a previously downloaded backup (.tar) and click 'Restore'.",
  UPLOAD_NOTE: 'Only .tar files are supported.',
  UPLOAD_FILE: 'Select backup file:',
  NO_FILE: 'No file chosen',
};

export const BACKUP_UPLOAD_BUTTON_LABELS = {
  BACKUP: 'Backup',
  RESTORE: 'Restore',
  CHOOSE_FILE: 'Choose File',
};

export const BACKUP_UPLOAD_BUTTON_VARIANTS = {
  BACKUP: 'primary',
  RESTORE: 'primary',
  CHOOSE_FILE: 'cancel',
};

export const BACKUP_UPLOAD_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const BACKUP_UPLOAD_CHOOSE_FILE_BUTTON_STYLE = {
  ...BACKUP_UPLOAD_BUTTON_STYLE,
  minWidth: 120,
};

export const BACKUP_UPLOAD_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  BACKUP_UPLOAD_PAGE_TITLE,
];

export const BACKUP_UPLOAD_MESSAGES = {
  BACKUP_DOWNLOAD_SUCCESS: 'Backup downloaded successfully',
  BACKUP_DOWNLOAD_FAILED: 'Backup download failed',
  SELECT_TAR_FILE: 'Please select a .tar backup file',
  ONLY_TAR_SUPPORTED: 'Only .tar files are supported',
  RESTORE_SUCCESS:
    'Restore completed. Please restart the system to apply changes.',
  RESTORE_FAILED: 'Restore failed',
};

export const BACKUP_UPLOAD_STATUS = {
  BACKING_UP: 'Backing up...',
  RESTORING: 'Restoring...',
};

export const BACKUP_UPLOAD_FILE = {
  DEFAULT_FILE_NAME: 'backup.tar',
  ACCEPT_EXTENSION: '.tar',
  INPUT_ID: 'backup-file-input',
};

export const BACKUP_UPLOAD_TAR_FILE_REGEX = /\.tar$/i;

export const BACKUP_UPLOAD_MESSAGE_TIMEOUT_MS = 5000;

export const BACKUP_UPLOAD_MESSAGE_DEFAULT = { type: '', text: '' };
