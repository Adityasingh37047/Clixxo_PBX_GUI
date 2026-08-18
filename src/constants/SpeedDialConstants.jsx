export const SPEED_DIAL_ITEMS_PER_PAGE = 50;

export const SPEED_DIAL_TITLE = 'Speed Dial';

export const SPEED_DIAL_BTN_CLEAR_ALL = 'Clear All';

export const SPEED_DIAL_CONFIRM_CLEAR_ALL = {
  FIRST: (count) =>
    `Are you sure you want to delete all ${count} speed dial(s)? This action cannot be undone.`,
  SECOND: 'Are you absolutely sure you want to clear all speed dials?',
};

/** Field tooltips for Speed Dial */
export const SPEED_DIAL_FIELD_TOOLTIPS = {
  name:
    'User-defined name of a speed dial. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  speed_dial_number:
    'The number dialed to reach this speed dial. Enter a number of 1 to 9 digits that is not already used by another extension or feature. This field is empty by default and must be filled in, otherwise the configuration cannot be saved.',

  destination:
    'Select the destination to ring when the speed dial is dialed. Call Queue: Ring the call queue. CallBacks: Ring the callbacks. Conference Rooms: Ring the conference rooms. DISA: Ring the DISA. Extensions: Ring the extensions. Fax To Mail: Ring the fax to mail. IVR Menus: Ring the IVR menus. Ring Group: Ring the ring group. Voicemails: Ring the voicemails. Other: Hang up the call.',
};
