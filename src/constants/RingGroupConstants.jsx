export const RING_GROUP_ITEMS_PER_PAGE = 20;

export const RING_GROUP_TITLE = 'Ring Group';

export const RING_GROUP_ENABLE_OPTIONS = ['Yes', 'No'];

export const RING_GROUP_RING_STRATEGY_OPTIONS = [
  'simultaneous',
  'sequential',
  'random',
];

export const RING_GROUP_EXTENSION_ANSWER_CONFIRM_OPTIONS = ['Yes', 'No'];

export const RING_GROUP_RING_TIMEOUT_OPTIONS = Array.from({ length: 20 }, (_, i) =>
  String((i + 1) * 5),
);

export const RING_GROUP_TIMEOUT_DESTINATION_OPTIONS = [
  { label: 'Call Queue', value: 'call_queue' },
  { label: 'CallBacks', value: 'callbacks' },
  { label: 'Conference Rooms', value: 'conference_rooms' },
  { label: 'DISA', value: 'disa' },
  { label: 'Extensions', value: 'extensions' },
  { label: 'Fax To Mail', value: 'faxtoemail' },
  { label: 'IVR Menus', value: 'ivr_menus' },
  { label: 'Ring Group', value: 'ring_groups' },
  { label: 'Voicemails', value: 'voicemail' },
  { label: 'Other', value: 'other' },
];

export const RING_GROUP_RING_BACK_MENU_PROPS = {
  PaperProps: { sx: { maxHeight: 360 } },
};

export const RING_GROUP_EMPTY_RING_BACK_OPTIONS = {
  moh_categories: [],
  custom_prompts: [],
  country_tones: [],
};

/** Field tooltips for Ring Group */
export const RING_GROUP_FIELD_TOOLTIPS = {
  name:
    'User-defined name of a ring group. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  ring_strategy:
    'Select the ring strategy for this ring group. Simultaneous: All available extensions ring simultaneously. Sequential: The extensions ring in the order already configured. Random: All available extensions ring randomly.',

  ring_timeout:
    'The timeout time to ring next extension, and also the timeout time to enter Timeout destination if all extensions are unavailable. The default value is 30s.',

  alert_info:
    'Set the content of the alert-info field. By default it is null.',

  extension_answer_confirm:
    'If set to Yes, the extension user will hear the following prompts upon picking up the call: Press 1 to answer: press 2 to reject. The default setting is No.',

  ring_group_number:
    'The number dialed to reach this ring group. The default range is 6200–6299 and can be modified in PBX → Preference → Extension Preferences. This field is empty by default and must be filled in, otherwise the configuration cannot be saved.',

  timeout_destination:
    'Select the destination to ring when the timeout period is reached. Call Queue: Ring the call queue. CallBacks: Ring the callbacks. Conference Rooms: Ring the conference rooms. DISA: Ring the DISA. Extensions: Ring the extensions. Fax To Mail: Ring the fax to mail. IVR Menus: Ring the IVR menus. Ring Group: Ring the ring group. Voicemails: Ring the voicemails. Other: Hang up the call.',

  enabled:
    'Set whether to enable this ring group. Yes: The ring group is enabled. No: The ring group is disabled.',

  ring_back:
    'Select the ring back to play when the ring group rings. By default it is null.',

  caller_id_name_prefix:
    'The prefix of a caller ID name sent when the ring group rings. By default it is null.',
};
