export const FEATURE_CODE_SECTIONS = [
  {
    title: 'Feature Code Digits Timeout',
    fields: [
      [{ key: 'digits_timeout', label: 'Digits Timeout (ms)', type: 'number', span: 1 }],
    ],
  },
  {
    title: 'Recording',
    fields: [
      [
        { key: 'one_touch_record', label: 'One Touch Record', type: 'text' },
        { key: 'agent_free_busy_ivr', label: 'Agent Free/Busy', type: 'text' },
      ],
    ],
  },
  {
    title: 'Transfer',
    fields: [
      [
        { key: 'blind_transfer', label: 'Blind Transfer', type: 'text' },
        { key: 'attended_transfer_timeout', label: 'Attended Transfer TimeOut (s)', type: 'number' },
      ],
      [
        { key: 'attended_transfer', label: 'Attended Transfer', type: 'text', span: 1 },
      ],
    ],
  },
  {
    title: 'Intercept',
    fields: [
      [
        { key: 'group_intercept', label: 'Group Intercept', type: 'text' },
        { key: 'extension_intercept', label: 'Extension Intercept', type: 'text' },
      ],
    ],
  },
  {
    title: 'Intercom',
    fields: [
      [
        { key: 'intercom', label: 'Intercom', type: 'text', span: 1 },
      ],
    ],
  },
  {
    title: 'Agent',
    fields: [
      [
        { key: 'agent_login_logout', label: 'Agent Login/Logout', type: 'text' },
        { key: 'agent_status_id', label: 'Agent Status ID', type: 'text' },
      ],
      [
        { key: 'agent_free_busy', label: 'Agent Free/Busy', type: 'text', span: 1 },
      ],
    ],
  },
];

export const FEATURE_CODE_INITIAL_FORM = {
  digits_timeout: '5000',
  one_touch_record: '*2',
  agent_free_busy_ivr: '',
  blind_transfer: '*1',
  attended_transfer_timeout: '15',
  attended_transfer: '*4',
  group_intercept: '*8',
  extension_intercept: '**',
  intercom: '*88',
  agent_login_logout: '*22',
  agent_status_id: '*23',
  agent_free_busy: '*24',
};

export const FORM_TO_API = {
  digits_timeout:           'feature_digit_timeout_ms',
  one_touch_record:         'recording_onetouch_code',
  agent_free_busy_ivr:      'agent_free_busy_ivr',
  blind_transfer:           'blind_transfer_code',
  attended_transfer_timeout:'attended_transfer_timeout_s',
  attended_transfer:        'attended_transfer_code',
  group_intercept:          'group_intercept_code',
  extension_intercept:      'extension_intercept_code',
  intercom:                 'intercom_code',
  agent_login_logout:       'agent_login_logout_code',
  agent_status_id:          'agent_status_id_code',
  agent_free_busy:          'agent_free_busy_code',
};

export const API_TO_FORM = Object.fromEntries(
  Object.entries(FORM_TO_API).map(([formKey, apiKey]) => [apiKey, formKey])
);

export const NUMERIC_KEYS = new Set(['digits_timeout', 'attended_transfer_timeout']);
