// System Monitor Constants
export const SYSTEM_MONITOR_TITLE = 'System Monitor';

export const SYSTEM_MONITOR_FIELDS = [
  {
    key: 'watchdog',
    label: 'Watchdog:',
    type: 'checkbox',
    defaultValue: true,
  },
  {
    key: 'watchdogTime',
    label: 'Dog Feeding Interval (s)',
    type: 'number',
    defaultValue: '5',
    min: 1,
    max: 15,
    dependsOn: 'watchdog',
  },
  {
    key: 'autoRestart',
    label: 'Automatically restart the service if undetected:',
    type: 'checkbox',
    defaultValue: true,
  },
  {
    key: 'lostConnectThreshold',
    label: 'Threshold to Judge Heartbeat Loss for Service(s):',
    type: 'number',
    defaultValue: '60',
    min: 20,
    max: 120,
    dependsOn: 'autoRestart',
  },
];

export const BUTTON_LABELS = {
  SAVE: 'Save',
  RESET: 'Reset',
  ENABLE: 'Enable',
};

export const VALIDATION_MESSAGES = {
  WATCHDOG_TIME_RANGE: "The range of to 'Dog Feeding interval' is 1~15s",
  HEARTBEAT_THRESHOLD_RANGE: "The range of 'the heatbeat loss threshold for Svr' is 20~120s",
};

