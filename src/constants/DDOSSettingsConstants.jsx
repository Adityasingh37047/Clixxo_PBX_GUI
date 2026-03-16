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
