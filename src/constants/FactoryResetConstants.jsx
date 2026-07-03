// Section title
export const FR_TITLE = 'Factory Reset';

// Instruction
export const FR_INSTRUCTION = "Click the button 'Reset' below to restore to factory settings.";

// Button label
export const FR_BUTTON = 'Reset';

export const FR_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  FR_TITLE,
];

export const FR_CONFIRM = {
  first:
    "If you factory reset the PBX, everything will be erased. Do you want to continue?",
  second: "Are you absolutely sure?",
};

export const FR_COMMANDS = {
  reset: "mysql astdb < /root/clixxo/DB/astdb.sql 2>&1",
};

export const FR_MESSAGES = {
  success:
    "Factory reset completed. Database astdb has been restored from astdb.sql.",
  commandFailed: "Factory reset command did not complete successfully.",
  resetFailed:
    "Failed to run factory reset. Please check logs on the device.",
};

export const FR_STATUS = {
  resetting: "Resetting...",
  overlayMessage: "Resetting database to factory settings...",
};

export const FR_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const FR_TOAST_DURATION = 5000;
