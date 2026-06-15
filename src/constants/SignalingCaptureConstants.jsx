// Section titles
export const SC_SECTIONS = [
  'Data Capture',
  'TS Recording',
  'E1 Two-way Recording',
];

// Field labels
export const SC_LABELS = {
  networkInterface: 'Choose a network interface to capture Data',
  captureSyslog: 'Capture Syslog',
  enable: 'Enable',
  syslogDest: 'Destination address for syslog',
  pcmTs: 'Choose a PCM and TS to record data',
};

// Dropdown options - now fetched dynamically from system info
export const SC_PCM_OPTIONS = [
  { value: 'pcm0', label: 'PCM 0' },
];
export const SC_TS_OPTIONS = [
  { value: 'ts16', label: 'E1 Time Slot 16' },
  { value: 'ts31', label: 'E1 Time Slot 31(T1 T)' },
  { value: 'ts1', label: 'E1 Time Slot 1(T1 Tir)' },
  { value: 'ts2', label: 'E1 Time Slot 2(T1 Tir)' },
];

// Button labels
export const SC_BUTTONS = {
  start: 'Start',
  stop: 'Stop',
  clean: 'Clean Data',
  download: 'Download Log',
};

export const SC_DATA_CAPTURE_PATTERN = 'signaling_capture';
export const SC_TS_RECORD_PREFIX = 'signaling_ts_record';
export const SC_E1_RECORD_PREFIX = 'signaling_e1_twoway';
export const SC_CAPTURE_LOG_PATH = '/mnt/data/tcpdump_capture.log';
export const SC_DATA_DIR = '/mnt/data';

// Red note
export const SC_NOTE = "Note: If capture, the function 'Remote Data Capture Config' in 'Management' would be closed.";
