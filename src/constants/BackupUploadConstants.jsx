// Section titles
export const BU_TITLES = {
  backup: 'Full System Backup',
  upload: 'Restore Backup',
};

// Field labels and instructions
export const BU_LABELS = {
  backupInstruction: "Download a complete server backup as a .tar archive.",
  uploadInstruction: "Select a previously downloaded backup (.tar) and click 'Restore'.",
  uploadNote: 'Only .tar files are supported.',
  uploadFile: 'Select backup file:',
  chooseFile: 'Choose File',
  noFile: 'No file chosen',
};

// Button labels
export const BU_BUTTONS = {
  backup: 'Backup',
  upload: 'Restore',
};

export const BU_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  "Backup & Upload",
];

export const BU_MESSAGES = {
  backupDownloadSuccess: "Backup downloaded successfully",
  backupDownloadFailed: "Backup download failed",
  selectTarFile: "Please select a .tar backup file",
  onlyTarSupported: "Only .tar files are supported",
  restoreSuccess: "Restore completed. Please restart the system to apply changes.",
  restoreFailed: "Restore failed",
};

export const BU_STATUS = {
  backingUp: "Backing up...",
  restoring: "Restoring...",
};

export const BU_FILE = {
  defaultFileName: "backup.tar",
  acceptExtension: ".tar",
  inputId: "backup-file-input",
};

export const BU_TAR_FILE_REGEX = /\.tar$/i;

export const BU_MESSAGE_TIMEOUT_MS = 5000;

export const BU_DEFAULT_MESSAGE = { type: "", text: "" };
