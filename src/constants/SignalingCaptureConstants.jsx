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
  pleaseWait: 'Please wait…',
};

export const SC_DATA_CAPTURE_PATTERN = 'signaling_capture';
export const SC_TS_RECORD_PREFIX = 'signaling_ts_record';
export const SC_E1_RECORD_PREFIX = 'signaling_e1_twoway';
export const SC_CAPTURE_LOG_PATH = '/mnt/data/tcpdump_capture.log';
export const SC_DATA_DIR = '/mnt/data';

// Red note
export const SC_NOTE = "Note: If capture, the function 'Remote Data Capture Config' in 'Management' would be closed.";

export const SC_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const SC_TOAST_DURATION = 3500;

export const SC_FALLBACK_NETWORK_OPTIONS = [
  { value: "all", label: "All LAN", ip: "" },
  { value: "eth0", label: "LAN 1", ip: "" },
  { value: "eth1", label: "LAN 2", ip: "" },
];

export const SC_DEFAULTS = {
  NETWORK: SC_FALLBACK_NETWORK_OPTIONS[0].value,
  SYSLOG_DESTINATION: "192.168.0.254",
};

export const SC_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  "Signaling Capture",
];

export const SC_TOOLTIPS = {
  networkInterface:
    "Select the network interface to capture packet data on. Choose All LAN to monitor every interface, or a specific LAN port to limit capture to that network.",
  captureSyslog:
    "Limit packet capture to syslog traffic only. When enabled, only packets sent to or from the configured syslog destination are recorded.",
  syslogDest:
    "IP address of the syslog server used to filter captured traffic. Capture includes UDP and TCP traffic on port 514 to or from this address.",
  pcmTs:
    "Select the PCM trunk and E1 time slot to record signaling data from. PCM identifies the physical trunk; the time slot specifies which channel on that trunk to monitor.",
  e1PcmTs:
    "Select the PCM trunk and E1 time slot for two-way E1 signaling capture. PCM identifies the physical trunk; the time slot specifies which channel to record in both directions.",
};