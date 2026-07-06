export const SQL_UPLOAD_PAGE_TITLE = 'SQL Upload';

export const SQL_UPLOAD_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  SQL_UPLOAD_PAGE_TITLE,
];

export const SQL_UPLOAD_LABELS = {
  instruction:
    'Upload a verified .sql update file. Only use files from trusted sources.',
  noFile: 'No file chosen',
};

export const SQL_UPLOAD_BUTTON_LABELS = {
  CHOOSE_FILE: 'Choose File',
  UPLOAD: 'Upload SQL',
  UPLOADING: 'Uploading...',
};

export const SQL_UPLOAD_BUTTON_VARIANTS = {
  CHOOSE_FILE: 'cancel',
  UPLOAD: 'primary',
};

export const SQL_UPLOAD_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 10,
  padding: '6px 14px',
};

export const SQL_UPLOAD_UPLOAD_BUTTON_STYLE = {
  ...SQL_UPLOAD_BUTTON_STYLE,
  width: '100%',
  height: 36,
  minHeight: 36,
  padding: '8px 14px',
};

export const SQL_UPLOAD_MESSAGES = {
  chooseFileRequired: 'Please choose a .sql file.',
  sqlOnly: 'Only .sql files are allowed.',
  uploadFailed: 'Upload failed',
  restoreSuccess: 'Database restored successfully',
};

export const SQL_UPLOAD_FILE = {
  accept: '.sql',
  inputId: 'sql-file-input',
};

export const SQL_UPLOAD_DEFAULT_TOAST = {
  msg: '',
  type: 'success',
};

export const SQL_UPLOAD_TOAST_DURATION_MS = 3500;

export const SQL_UPLOAD_ERROR_HIDE_MS = 5000;
