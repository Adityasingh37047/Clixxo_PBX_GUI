// TR069 Config Constants
export const TR069_CONFIG_TITLE = 'TR069 Settings';

export const TR069_CONFIG_FIELDS = [
  {
    key: 'enable_tr069',
    label: 'TR069:',
    type: 'checkbox',
    defaultValue: false,
  },
  {
    key: 'acs_url',
    label: 'CPE to ACS URL:',
    type: 'text',
    defaultValue: '',
    maxLength: 128,
    dependsOn: 'enable_tr069',
  },
  {
    key: 'authmode',
    label: 'ACS Authentication Mode:',
    type: 'select',
    defaultValue: '0',
    options: [
      { value: '0', label: 'NONE' },
      { value: '1', label: 'BASIC' },
      { value: '2', label: 'DIGEST' },
    ],
    dependsOn: 'enable_tr069',
  },
  {
    key: 'username',
    label: 'ACS Username:',
    type: 'text',
    defaultValue: '',
    maxLength: 128,
    dependsOn: 'authmode',
    dependsOnValue: ['1', '2'],
  },
  {
    key: 'password',
    label: 'ACS Password:',
    type: 'text',
    defaultValue: '',
    maxLength: 128,
    dependsOn: 'authmode',
    dependsOnValue: ['1', '2'],
  },
  {
    key: 'informInterval',
    label: 'CPE Inform Interval(s):',
    type: 'number',
    defaultValue: '86400',
    dependsOn: 'enable_tr069',
  },
  {
    key: 'enable_stun',
    label: 'STUN ENABLE',
    type: 'checkbox',
    defaultValue: false,
    dependsOn: 'enable_tr069',
  },
  {
    key: 'stun_server',
    label: 'STUN Server IP:',
    type: 'text',
    defaultValue: '',
    maxLength: 128,
    dependsOn: 'enable_stun',
  },
  {
    key: 'stun_serverPort',
    label: 'STUN Server Port:',
    type: 'text',
    defaultValue: '3478',
    maxLength: 128,
    dependsOn: 'enable_stun',
  },
];

export const BUTTON_LABELS = {
  SAVE: 'Save',
  RESET: 'Reset',
  ENABLE: 'Enable',
};

export const VALIDATION_MESSAGES = {
  ACS_URL_REQUIRED: 'Please enter the CPE to ACS URL!',
  INFORM_INTERVAL_REQUIRED: 'Please enter the CPE Inform Interval!',
  INFORM_INTERVAL_RANGE: 'The time range of CPE Inform Interval is 30-3600！',
  USERNAME_REQUIRED: 'Please enter the ACS Username!',
  USERNAME_LENGTH: 'The length of ACS Username String cannot exceed 128!',
  PASSWORD_REQUIRED: 'Please enter the ACS Password!',
  PASSWORD_LENGTH: 'The length of ACS Password String cannot exceed 128!',
};

