export const DDOS_FIELDS = [
  { key: 'webPortAttack', label: 'WEB Port Attack Protection', type: 'checkbox' },
  { key: 'ftpPortAttack', label: 'FTP Port Attack Protection', type: 'checkbox' },
  { key: 'ftpLimit', label: 'FTP Limit', type: 'number' },
  { key: 'sshPortAttack', label: 'SSH Port Attack Protection', type: 'checkbox' },
  { key: 'sshLimit', label: 'SSH Limit', type: 'number' },
  { key: 'telnetPortAttack', label: 'TELNET Port Attack Protection', type: 'checkbox' },
  { key: 'telnetLimit', label: 'TELNET Limit', type: 'number' },
  { key: 'blacklistValidityType', label: 'Set Validity of Attacker IP Blacklist', type: 'select', options: [
    { value: 'inSetTime', label: 'In The Set Time' },
  ] },
  { key: 'blacklistTime', label: 'Time (Min)', type: 'number' },
];

export const DDOS_INITIAL_FORM = {
  webPortAttack: false,
  webLimit: 8,
  ftpPortAttack: true,
  ftpLimit: 2,
  sshPortAttack: true,
  sshLimit: 2,
  telnetPortAttack: true,
  telnetLimit: 2,
  blacklistValidityType: 'inSetTime',
  blacklistTime: 2,
};

export const DDOS_INFO_LOG = ``;


export const DDOS_CARD_TITLE = "DDOS Settings";

export const DDOS_SETTINGS_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  DDOS_CARD_TITLE,
];

export const DDOS_MESSAGE_DEFAULT = { type: "", text: "" };
export const DDOS_MESSAGE_TIMEOUT_MS = 5000;

export const DDOS_MESSAGES = {
  configureSuccess: "DDOS Protection configured successfully!",
  configureFailed: "Failed to configure DDOS protection",
  removeSuccess: "DDOS Protection removed successfully!",
  removeFailed: "Failed to remove DDOS protection",
  resetSuccess: "Form reset to default values",
  simulateTriggered: "Attack simulation triggered",
  logsCleared: "Logs cleared",
};

export const DDOS_TOOLTIPS = {
  webPortAttack:
    "Protects the system from suspicious or excessive access attempts targeting web management ports.",
  ftpPortAttack: "Protects the system from suspicious or excessive access attempts targeting FTP ports.",
  sshPortAttack: "Protects the system from suspicious or excessive access attempts targeting SSH ports.",
  telnetPortAttack: "Protects the system from suspicious or excessive access attempts targeting TELNET ports.",
  blacklistValidity: "Specifies how long a blacklisted IP address remains blocked before being automatically removed from the blacklist.",
  blacklistTime: "Specifies the time duration for which a blacklisted IP address remains blocked.",
  ftpLimit: "Specifies the maximum number of FTP connections allowed per minute.",
  sshLimit: "Specifies the maximum number of SSH connections allowed per minute.",
  telnetLimit: "Specifies the maximum number of TELNET connections allowed per minute.",
  webLimit: "Specifies the maximum number of WEB connections allowed per minute.",
};

export const DDOS_LOCAL_STORAGE_KEY = "ddosSettingsForm";

export const DDOS_SIMULATION_IPS = [
  "192.168.1.100",
  "10.0.0.50",
  "172.16.0.25",
  "203.0.113.10",
];

export const DDOS_SERVICE_PORTS = {
  web: [80, 443],
  ftp: [21],
  ssh: [22],
  telnet: [23],
};

export const DDOS_BUTTON_LABELS = {
  RESET: "Reset",
  SAVE: "Save",
  CONFIGURING: "Configuring...",
  SIMULATE_ATTACK: "Simulate Attack",
  CLEAR_LOGS: "Clear Logs",
};


  