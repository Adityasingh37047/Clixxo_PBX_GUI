export const SIGNALING_CAPTURE_TITLE = 'Signaling Capture';
export const SIGNALING_CAPTURE_CARD_TITLE = SIGNALING_CAPTURE_TITLE;

export const SIGNALING_CAPTURE_SECTIONS = [
  'Data Capture',
  'TS Recording',
  'E1 Two-way Recording',
];

export const SIGNALING_CAPTURE_LABELS = {
  networkInterface: 'Choose a network interface to capture Data',
  captureSyslog: 'Capture Syslog',
  enable: 'Enable',
  syslogDest: 'Destination address for syslog',
  pcmTs: 'Choose a PCM and TS to record data',
};

export const SIGNALING_CAPTURE_PCM_OPTIONS = [
  { value: 'pcm0', label: 'PCM 0' },
];

export const SIGNALING_CAPTURE_TS_OPTIONS = [
  { value: 'ts16', label: 'E1 Time Slot 16' },
  { value: 'ts31', label: 'E1 Time Slot 31(T1 T)' },
  { value: 'ts1', label: 'E1 Time Slot 1(T1 Tir)' },
  { value: 'ts2', label: 'E1 Time Slot 2(T1 Tir)' },
];

export const SIGNALING_CAPTURE_BUTTON_LABELS = {
  START: 'Start',
  STOP: 'Stop',
  CLEAN: 'Clean Data',
  DOWNLOAD: 'Download Log',
  PLEASE_WAIT: 'Please wait…',
};

export const SIGNALING_CAPTURE_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  CANCEL: 'cancel',
};

export const SIGNALING_CAPTURE_PRIMARY_BUTTON_STYLE = {
  height: 30,
  padding: '6px 14px',
  fontSize: 12,
  borderRadius: 10,
};

export const SIGNALING_CAPTURE_CANCEL_BUTTON_STYLE = {
  height: 30,
  background: '#cbd5e1',
  color: '#374151',
  border: '1px solid #cbd5e1',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
};

export const SIGNALING_CAPTURE_FOOTER_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 10,
  padding: '6px 14px',
  margin: 0,
  boxSizing: 'border-box',
};

export const SIGNALING_CAPTURE_DATA_CAPTURE_PATTERN = 'signaling_capture';
export const SIGNALING_CAPTURE_TS_RECORD_PREFIX = 'signaling_ts_record';
export const SIGNALING_CAPTURE_E1_RECORD_PREFIX = 'signaling_e1_twoway';
export const SIGNALING_CAPTURE_LOG_PATH = '/mnt/data/tcpdump_capture.log';
export const SIGNALING_CAPTURE_DATA_DIR = '/mnt/data';

export const SIGNALING_CAPTURE_NOTE =
  "Note: If capture, the function 'Remote Data Capture Config' in 'Management' would be closed.";

export const SIGNALING_CAPTURE_TOAST_DEFAULT = {
  msg: '',
  type: 'success',
};

export const SIGNALING_CAPTURE_TOAST_DURATION_MS = 3500;

export const SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS = [
  { value: 'all', label: 'All LAN', ip: '' },
  { value: 'eth0', label: 'LAN 1', ip: '' },
  { value: 'eth1', label: 'LAN 2', ip: '' },
];

export const SIGNALING_CAPTURE_DEFAULTS = {
  NETWORK: SIGNALING_CAPTURE_FALLBACK_NETWORK_OPTIONS[0].value,
  SYSLOG_DESTINATION: '192.168.0.254',
};

export const SIGNALING_CAPTURE_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  SIGNALING_CAPTURE_TITLE,
];

export const SIGNALING_CAPTURE_TOOLTIPS = {
  networkInterface:
    'Select the network interface to capture packet data on. Choose All LAN to monitor every interface, or a specific LAN port to limit capture to that network.',
  captureSyslog:
    'Limit packet capture to syslog traffic only. When enabled, only packets sent to or from the configured syslog destination are recorded.',
  syslogDest:
    'IP address of the syslog server used to filter captured traffic. Capture includes UDP and TCP traffic on port 514 to or from this address.',
  pcmTs:
    'Select the PCM trunk and E1 time slot to record signaling data from. PCM identifies the physical trunk; the time slot specifies which channel on that trunk to monitor.',
  e1PcmTs:
    'Select the PCM trunk and E1 time slot for two-way E1 signaling capture. PCM identifies the physical trunk; the time slot specifies which channel to record in both directions.',
};
