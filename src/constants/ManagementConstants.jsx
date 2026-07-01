export const MANAGEMENT_PAGE_BREADCRUMB_ROOT = "System";
export const MANAGEMENT_PAGE_BREADCRUMB_SECTION = "System Settings";
export const MANAGEMENT_PAGE_TITLE = "Management";
export const MANAGEMENT_CARD_TITLE = "Management Parameters";

export const MANAGEMENT_BTN_SAVE = "Save";
export const MANAGEMENT_BTN_RESET = "Reset";

export const MANAGEMENT_LOADING_TEXT = "Loading management parameters...";

export const MANAGEMENT_SECTION_HEADING_LEFT = -20;
export const MANAGEMENT_SECTION_HEADING_COLOR = "#30415A";

export const MANAGEMENT_HINT_WHITELIST_DOT =
  "IP addresses are separated by '.'";
export const MANAGEMENT_HINT_WEB_IP_COMMA =
  "IP addresses are separated by ','";

export const MANAGEMENT_LEFT_SECTION_NAMES = [
  "WEB Management",
  "SSH Management Config",
  "Remote Data Capture Config",
  "FTP Config",
  "Telnet Config",
];

export const MANAGEMENT_FIELD_TOOLTIPS = {
  webPort: "TCP port used to access the web management interface.",
  webAccess:
    "Controls which client IP addresses are allowed to access the web interface.",
  webIpAddress:
    "IP addresses for the access list. Used when whitelist or blacklist mode is selected.",
  webTimeout:
    "Inactivity period in seconds before the web session is automatically logged out.",
  webWhitelist:
    "IP addresses permitted to access the web interface under whitelist restrictions.",
  sshEnable: "Enable or disable SSH remote shell access to the system.",
  sshPort: "TCP port used for SSH connections.",
  sshWhitelist: "IP addresses allowed to connect via SSH.",
  remoteDataCapture:
    "Enable or disable remote packet and call data capture on the system.",
  captureRtp: "Include RTP media streams in remote data capture.",
  captureRtpInterface: "Network interface used when capturing RTP traffic.",
  ftpEnable: "Enable or disable FTP file transfer access.",
  ftpWhitelist: "IP addresses allowed to connect via FTP.",
  telnetEnable: "Enable or disable Telnet remote access.",
  telnetWhitelist: "IP addresses allowed to connect via Telnet.",
  syslogEnable:
    "Enable or disable forwarding of system log messages to a remote server.",
  syslogServerAddress: "IP address or hostname of the remote syslog server.",
  syslogLevel: "Minimum severity of log messages sent to the syslog server.",
  cdrEnable:
    "Enable or disable sending call detail records to a remote server.",
  cdrServerAddress: "IP address or hostname of the CDR server.",
  cdrServerPort: "Port used to send CDR data to the remote server.",
  cdrSendFailed:
    "Include call records for failed or unanswered calls in CDR output.",
  cdrContent: "Level of detail included in each call detail record.",
  cdrHangup: "Include which party initiated the call hangup in the CDR.",
  cdrAddLanIp:
    "Append LAN1 and LAN2 IPv4 addresses to each call detail record.",
  cdrSendNumberClass:
    "Enable sending number classification data to a separate server.",
  cdrServerIp: "IP address of the number classification server.",
  cdrServerPortClass: "Port used by the number classification server.",
  cdrKeepRouting:
    "Continue normal call routing if the CDR server is unreachable.",
  cdrAllowDeny:
    "Allow or deny CDR transmission based on configured access rules.",
  ntpEnable: "Enable or disable automatic time synchronization using NTP.",
  ntpServerAddress: "IP address or hostname of the NTP time server.",
  synchronizingCycle: "Interval in seconds between NTP synchronization attempts.",
  dailyRestart: "Enable or disable a scheduled daily system restart.",
  restartHour: "Hour of the day when the scheduled daily restart occurs.",
  restartMinute: "Minute within the selected hour when the daily restart occurs.",
  systemTime: "Current system date and time. Enable Modify to edit manually.",
  modifyTime: "Allow manual changes to the system date and time.",
  timeZone: "Time zone offset applied to system time and scheduling.",
};

export const MANAGEMENT_SECTIONS = [
  {
    section: 'WEB Management',
    fields: [
      { name: 'webPort', label: 'WEB Port', type: 'text', initial: '' },
      { name: 'webAccess', label: 'Access Setting', type: 'select', options: [
        { value: 'all', label: 'Allow All IPs' },
        { value: 'whitelist', label: 'IPs in Whitelist' },
        { value: 'blacklist', label: 'IPs in Blacklist' }
      ], initial: 'all' },
      { name: 'webIpAddress', label: 'IP Address', type: 'textarea', initial: '', conditional: 'webAccess', conditionalValue: ['whitelist', 'blacklist'] },
      { name: 'webTimeout', label: 'Time to Log out', type: 'text', initial: '' },
      { name: 'webWhitelist', label: 'WEB whitelist address', type: 'textarea', initial: '' },
    ]
  },
  {
    section: 'SSH Management Config',
    fields: [
      { name: 'sshEnable', label: 'SSH', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'sshPort', label: 'SSH Port', type: 'text', initial: '', conditional: 'sshEnable', conditionalValue: 'Yes' },
      { name: 'sshWhitelist', label: 'SSH whitelist address', type: 'textarea', initial: '', conditional: 'sshEnable', conditionalValue: 'Yes' },
    ]
  },
  {
    section: 'Remote Data Capture Config',
    fields: [
      { name: 'remoteDataCapture', label: 'Remote Data Capture', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'captureRtp', label: 'Capture RTP', type: 'checkbox', initial: true, conditional: 'remoteDataCapture', conditionalValue: 'Yes' },
      { name: 'captureRtpInterface', label: '', type: 'select', options: [
          { value: 'lan1', label: 'LAN 1' },
          { value: 'lan2', label: 'LAN 2' }
        ], initial: 'lan1', conditionalAll: [
          { name: 'remoteDataCapture', value: 'Yes' },
          { name: 'captureRtp', value: true }
        ] },
    ]
  },
  {
    section: 'FTP Config',
    fields: [
      { name: 'ftpEnable', label: 'FTP', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'ftpWhitelist', label: 'FTP whitelist address', type: 'textarea', initial: '', conditional: 'ftpEnable', conditionalValue: 'Yes' },
    ]
  },
  {
    section: 'Telnet Config',
    fields: [
      { name: 'telnetEnable', label: 'Telnet', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'telnetWhitelist', label: 'TELNET whitelist address', type: 'textarea', initial: '', conditional: 'telnetEnable', conditionalValue: 'Yes' },
    ]
  },
  // ==================== COMMENTED OUT - WATCHDOG SETTING ====================
  // Uncomment below to show Watchdog Setting section
  // {
  //   section: 'Watchdog Setting',
  //   fields: [
  //     { name: 'watchdogEnable', label: 'Enable Watchdog', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
  //   ]
  // },
  // ========================================================================
  {
    section: 'SYSLOG Parameters',
    fields: [
      { name: 'syslogEnable', label: 'SYSLOG', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'syslogServerAddress', label: 'Server Address', type: 'text', initial: '127.0.0.1', conditional: 'syslogEnable', conditionalValue: 'Yes' },
      { name: 'syslogLevel', label: 'SYSLOG Level', type: 'select', options: [
        { value: 'ERROR', label: 'ERROR' },
        { value: 'WARNING', label: 'WARNING' },
        { value: 'INFO', label: 'INFO' },
        { value: 'DEBUG', label: 'DEBUG' }
      ], initial: 'ERROR', conditional: 'syslogEnable', conditionalValue: 'Yes' },
    ]
  },
  {
    section: 'CDR Parameters',
    fields: [
      { name: 'cdrEnable', label: 'Send CDR', type: 'radio', options: ['Yes', 'No'], initial: 'No' },
      { name: 'cdrServerAddress', label: 'Server Address', type: 'text', initial: '', conditional: 'cdrEnable', conditionalValue: 'Yes' },
      { name: 'cdrServerPort', label: 'Server Port', type: 'text', initial: '', conditional: 'cdrEnable', conditionalValue: 'Yes' },
      { name: 'cdrSendFailed', label: 'Send failed call record', type: 'checkbox', initial: false, conditional: 'cdrEnable', conditionalValue: 'Yes' },
      { 
        name: 'cdrContent', 
        label: 'Content', 
        type: 'select', 
        options: [
          { value: 'Basic Information', label: 'Basic Information' },
          { value: 'Detailed Information', label: 'Detailed Information' }
        ],
        initial: 'Basic Information',
        conditional: 'cdrSendFailed',
        conditionalValue: true
      },
      { name: 'cdrHangup', label: 'Add hangup side', type: 'checkbox', initial: false, conditional: 'cdrEnable', conditionalValue: 'Yes' },
      { name: 'cdrAddLanIp', label: 'add lan1,2 IPv4 address', type: 'checkbox', initial: false, conditional: 'cdrEnable', conditionalValue: 'Yes' },
      { name: 'cdrSendNumberClass', label: 'Send Number Classification Data', type: 'checkbox', initial: false },
      { name: 'cdrServerIp', label: 'Server Ip', type: 'text', initial: '127.0.0.1', conditional: 'cdrSendNumberClass', conditionalValue: true },
      { name: 'cdrServerPortClass', label: 'Server port', type: 'text', initial: '4', conditional: 'cdrSendNumberClass', conditionalValue: true },
      { name: 'cdrKeepRouting', label: 'Keep Routing in Server Error', type: 'checkbox', initial: false, conditional: 'cdrEnable', conditionalValue: 'Yes' },
      // { name: 'cdrDebugPhp', label: 'Interface of debug.php', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'cdrAllowDeny', label: 'Allow/Deny', type: 'radio', options: ['Allow', 'Deny'], initial: 'Allow' },
    ]
  },
  // ==================== COMMENTED OUT - ACCESS TO THE INTERFACE ====================
  // Uncomment below to show Access to the interface section
  // {
  //   section: 'Access to the interface',
  //   fields: [
  //     { name: 'accessDebugPhp', label: 'Interface of debug.php', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
  //   ]
  // },
  // ==================================================================================
  {
    section: 'Time Parameters',
    fields: [
      { name: 'ntpEnable', label: 'NTP', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      { name: 'ntpServerAddress', label: 'NTP Server Address', type: 'text', initial: '127.0.0.1', conditional: 'ntpEnable', conditionalValue: 'Yes' },
      { name: 'synchronizingCycle', label: 'Synchronizing Cycle', type: 'text', initial: '3600', conditional: 'ntpEnable', conditionalValue: 'Yes' },
      { name: 'dailyRestart', label: 'Daily Restart', type: 'radio', options: ['Yes', 'No'], initial: 'Yes' },
      // Restart Time (visible only when Daily Restart = Yes)
      { 
        name: 'restartHour', 
        label: 'Restart Time', 
        type: 'select', 
        options: Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: String(i) })),
        initial: '0',
        conditional: 'dailyRestart',
        conditionalValue: 'Yes',
        unit: 'h'
      },
      { 
        name: 'restartMinute', 
        label: '', 
        type: 'select', 
        options: Array.from({ length: 60 }, (_, i) => ({ value: String(i), label: String(i) })),
        initial: '0',
        conditional: 'dailyRestart',
        conditionalValue: 'Yes',
        unit: 'm'
      },
      { name: 'systemTime', label: 'System Time', type: 'text', initial: '' },
      { name: 'modifyTime', label: 'Modify', type: 'checkbox', initial: false },
      { name: 'timeZone', label: 'Time Zone', type: 'select', options: [
          { value: 'GMT+5:30', label: 'GMT+5:30 (India)' },
      ], initial: 'GMT+5:30' },
    ]
  },
];

export const MANAGEMENT_INITIAL_FORM = MANAGEMENT_SECTIONS.reduce((acc, section) => {
  section.fields.forEach(field => {
    acc[field.name] = field.initial;
  });
  return acc;
}, { modifyTimeValue: '' });
