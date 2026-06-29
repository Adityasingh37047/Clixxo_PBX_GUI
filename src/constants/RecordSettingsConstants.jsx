export const RECORD_SETTINGS_TITLE = 'Record Settings';

export const RECORD_SETTINGS_PROMPT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'default', label: 'Default' },
  { value: 'blank', label: 'Blank' },
  { value: 'busy', label: 'Busy' },
  { value: 'thankyou', label: 'Thankyou' },
  { value: 'welcome', label: 'WELCOME' },
];

export const RECORD_SETTINGS_FORM_FIELDS = [
  {
    key: 'internalPrompt',
    label: 'Internal Call Being Recorded Prompt',
    tooltipKey: 'internal_prompt',
    options: RECORD_SETTINGS_PROMPT_OPTIONS,
    defaultValue: 'none',
  },
  {
    key: 'outboundInboundPrompt',
    label: 'Outbound/Inbound Calls Being Recorded Prompt',
    tooltipKey: 'outbound_inbound_prompt',
    options: RECORD_SETTINGS_PROMPT_OPTIONS,
    defaultValue: 'none',
  },
  {
    key: 'recordStart',
    label: 'Record Start',
    tooltipKey: 'record_start',
    options: [
      { value: 'after_media', label: 'After Media' },
      { value: 'after_answer', label: 'After Answer' },
    ],
    defaultValue: 'after_media',
  },
  {
    key: 'recordMode',
    label: 'Record Mode',
    tooltipKey: 'record_mode',
    options: [
      { value: 'both', label: 'Recording On both side' },
      { value: 'one', label: 'Recording On one side' },
    ],
    defaultValue: 'both',
  },
  {
    key: 'recordDirection',
    label: 'Record Direction',
    tooltipKey: 'record_direction',
    options: [
      { value: 'both', label: 'Incoming and Outgoing Recording' },
      { value: 'incoming', label: 'Incoming Recording' },
      { value: 'outgoing', label: 'Outgoing Recording' },
    ],
    defaultValue: 'both',
  },
  {
    key: 'recordSampleRate',
    label: 'Record Sample Rate',
    tooltipKey: 'record_sample_rate',
    options: [
      { value: '8000', label: '8000' },
      { value: '16000', label: '16000' },
    ],
    defaultValue: '8000',
  },
  {
    key: 'recordingFileFormat',
    label: 'Recording File Format',
    tooltipKey: 'recording_file_format',
    options: [
      { value: 'wav', label: 'WAV' },
      { value: 'mp3', label: 'MP3' },
    ],
    defaultValue: 'wav',
  },
  {
    key: 'recordpath',
    label: 'Record Path',
    tooltipKey: 'record_path',
    type: 'text',
    defaultValue: '',
  },
];

export const RECORD_SETTINGS_FIELD_TOOLTIPS = {
  internal_prompt:
    'The prompt that will be played to both the caller and the callee before the recording of internal calls. The default setting in None.',

  outbound_inbound_prompt:
    'The prompt that will be played to both the caller and the callee before the recording of outbound or inbound calls. The default setting in None.',

  record_start:
    'Set recordind time, recording time can be set after ringback of after answer, default is after answer.',

  record_mode:
    'Record mode, default is recording on one side: recording on one side: just one recording is profuced for a talk: recording on both side: two recording files are produced for a talk.',

  record_direction:
    'The direction of recording,default is incoming and outgoing recording: outgoing and incoming wrote to a recording file, incoming: just incoming wrote to a recording file: outgoing: just outgoing wrote to a recording file.',

  record_sample_rate: 'The sample rate of the recording, default is 8000.',

  recording_file_format: 'The format of the recording file, default is WAV.',

  record_path: 'The path to the recording file, default is local.',
};

export const RECORD_SETTINGS_DUAL_LIST_SECTIONS = [
  { key: 'trunks', title: 'Record Trunks' },
  { key: 'extensions', title: 'Record Extensions' },
  { key: 'conferences', title: 'Record Conferences' },
];
