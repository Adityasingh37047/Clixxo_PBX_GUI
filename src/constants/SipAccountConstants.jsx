export const SIP_ACCOUNT_FIELDS = [
  // BASIC -> General
  { name: 'extension', label: 'Extension', type: 'text', defaultValue: '' },
  { name: 'context', label: 'Context', type: 'text', defaultValue: '' },
  { name: 'allow_codecs', label: 'Allow Codecs', type: 'checkbox', defaultValue: '' },
  { name: 'password', label: 'Password', type: 'password', defaultValue: '' },
  { name: 'max_registrations', label: 'Max Registrations', type: 'text', defaultValue: '' },

  // BASIC -> User Info
  { name: 'user_name', label: 'Name', type: 'text', defaultValue: '' },
  { name: 'user_password', label: 'User Password', type: 'password', defaultValue: '' },
  { name: 'email', label: 'Email', type: 'text', defaultValue: '' },
  { name: 'mobile_number', label: 'Mobile Number', type: 'text', defaultValue: '' },

  // ADVANCED (existing networking fields)
  { name: 'from_domain', label: 'Domain name', type: 'text', defaultValue: '' },
  { name: 'contact_user', label: 'Contact User', type: 'text', defaultValue: '' },
  { name: 'outbound_proxy', label: 'Outbound Proxy', type: 'text', defaultValue: '' },

  // FEATURES -> Voicemail
  { name: 'voicemail_enabled', label: 'Voicemail Enabled', type: 'select', defaultValue: 'no' },
  { name: 'voicemail_keep_local', label: 'Voicemail Keep Local', type: 'select', defaultValue: 'yes' },
  { name: 'voicemail_file', label: 'Voicemail File', type: 'select', defaultValue: 'audio_file_attachment' },
  { name: 'voicemail_password', label: 'Voicemail Password', type: 'password', defaultValue: '' },
  { name: 'voicemail_voice', label: 'Select Voice', type: 'select', defaultValue: 'system_default' },

  // FEATURES -> Monitor
  { name: 'monitor_allow', label: 'Allow Being Monitored', type: 'select', defaultValue: 'disable' },
  { name: 'monitor_mode', label: 'Monitor Mode', type: 'select', defaultValue: 'none' },

  // FEATURES -> Call Forwarding
  { name: 'cf_always_enabled', label: 'CF Always Enabled', type: 'select', defaultValue: 'disabled' },
  { name: 'cf_always_number', label: 'CF Always Number', type: 'text', defaultValue: '' },
  { name: 'cf_always_time', label: 'CF Always Time Condition', type: 'select', defaultValue: 'all' },

  { name: 'cf_busy_enabled', label: 'CF On Busy Enabled', type: 'select', defaultValue: 'disabled' },
  { name: 'cf_busy_number', label: 'CF On Busy Number', type: 'text', defaultValue: '' },
  { name: 'cf_busy_time', label: 'CF On Busy Time Condition', type: 'select', defaultValue: 'all' },

  { name: 'cf_no_answer_enabled', label: 'CF No Answer Enabled', type: 'select', defaultValue: 'disabled' },
  { name: 'cf_no_answer_number', label: 'CF No Answer Number', type: 'text', defaultValue: '' },
  { name: 'cf_no_answer_time', label: 'CF No Answer Time Condition', type: 'select', defaultValue: 'all' },

  { name: 'cf_not_registered_enabled', label: 'CF Not Registered Enabled', type: 'select', defaultValue: 'disabled' },
  { name: 'cf_not_registered_number', label: 'CF Not Registered Number', type: 'text', defaultValue: '' },
  { name: 'cf_not_registered_time', label: 'CF Not Registered Time Condition', type: 'select', defaultValue: 'all' },

  // FEATURES -> Follow Me & DND
  { name: 'follow_me_enabled', label: 'Follow Me Enabled', type: 'select', defaultValue: 'disabled' },
  { name: 'follow_me_time', label: 'Follow Me Time Condition', type: 'select', defaultValue: 'all' },
  { name: 'follow_me_entries', label: 'Follow Me Destinations', type: 'text', defaultValue: [] },
  { name: 'follow_me_timeout_destination', label: 'Follow Me Timeout Destination', type: 'text', defaultValue: '' },
  { name: 'dnd_enabled', label: 'Do Not Disturb', type: 'select', defaultValue: 'disabled' },
  { name: 'dnd_time', label: 'Do Not Disturb Time Condition', type: 'select', defaultValue: 'all' },
  { name: 'dnd_special_numbers', label: 'Special Number for DND', type: 'text', defaultValue: [] },

  // FEATURES -> Mobility Extension
  { name: 'enable_mobility_extension', label: 'Enable Mobility Extension', type: 'select', defaultValue: 'no' },
  { name: 'ring_simultaneously', label: 'Ring Simultaneously', type: 'select', defaultValue: 'no' },
  { name: 'mobility_prefix', label: 'Mobility Prefix', type: 'text', defaultValue: '' },
  { name: 'mobility_timeout', label: 'Mobility Timeout', type: 'select', defaultValue: 30 },

  // FEATURES -> Secretary Service
  { name: 'secretary_service', label: 'Secretary Service', type: 'select', defaultValue: 'disabled' },
  { name: 'secretary_extension', label: 'Secretary Extension', type: 'text', defaultValue: '' },
];


export const CODEC_OPTIONS = [
  { value: 'ulaw', label: 'ulaw' },
  { value: 'alaw', label: 'alaw' },
  { value: 'gsm', label: 'gsm' },
  { value: 'g726', label: 'g726' },
  { value: 'g722', label: 'g722' },
  { value: 'g729', label: 'g729' }
];

export const SIP_ACCOUNT_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'extension', label: 'Extension' },
  { key: 'context', label: 'Context' },
  { key: 'allow_codecs', label: 'Allow Codecs' },
  { key: 'password', label: 'Password' },
  { key: 'status', label: 'Status' },
  { key: 'modify', label: 'Modify' },

];

export const SIP_ACCOUNT_INITIAL_FORM = SIP_ACCOUNT_FIELDS.reduce((acc, field) => {
  acc[field.name] = field.defaultValue;
  return acc;
}, {});
