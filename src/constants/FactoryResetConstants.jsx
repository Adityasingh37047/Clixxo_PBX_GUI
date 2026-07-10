export const FACTORY_RESET_TITLE = 'Factory Reset';

export const FACTORY_RESET_INSTRUCTION =
  "Click the button 'Reset' below to restore to factory settings.";

export const FACTORY_RESET_BUTTON_LABELS = {
  RESET: 'Reset',
};

export const FACTORY_RESET_BUTTON_VARIANTS = {
  RESET: 'primary',
};

export const FACTORY_RESET_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
};

export const FACTORY_RESET_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  FACTORY_RESET_TITLE,
];

export const FACTORY_RESET_CONFIRM = {
  FIRST:
    'If you factory reset the PBX, everything will be erased. Do you want to continue?',
  SECOND: 'Are you absolutely sure?',
};

export const FACTORY_RESET_COMMANDS = {
  RESET: 'mysql astdb < /root/clixxo/DB/astdb.sql 2>&1',
};

export const FACTORY_RESET_MESSAGES = {
  SUCCESS:
    'Factory reset completed. Database astdb has been restored from astdb.sql.',
  COMMAND_FAILED: 'Factory reset command did not complete successfully.',
  RESET_FAILED:
    'Failed to run factory reset. Please check logs on the device.',
};

export const FACTORY_RESET_STATUS = {
  RESETTING: 'Resetting...',
  OVERLAY_MESSAGE: 'Resetting database to factory settings...',
};

export const FACTORY_RESET_TOAST_DEFAULT = {
  msg: '',
  type: 'success',
};

export const FACTORY_RESET_TOAST_DURATION_MS = 5000;
