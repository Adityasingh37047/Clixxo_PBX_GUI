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
      { name: 'synchronizingCycle', label: 'Synchronizing Cycle', type: 'text', initial: '3600', conditional: 'ntpEnable', conditionalValue: 'Yes', unit: 's' },
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
