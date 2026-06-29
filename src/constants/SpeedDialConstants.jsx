export const SPEED_DIAL_ITEMS_PER_PAGE = 20;

export const SPEED_DIAL_TITLE = 'Speed Dial';

/** Field tooltips for Speed Dial */
export const SPEED_DIAL_FIELD_TOOLTIPS = {
  name:
    'User-defined name of a speed dial. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  speed_dial_number:
    'The number dialed to reach this speed dial. The default range is 6200–6299 and can be modified in PBX → Preference → Extension Preferences. This field is empty by default and must be filled in, otherwise the configuration cannot be saved.',

  destination:
    'Select the destination to ring when the speed dial is dialed. Call Queue: Ring the call queue. CallBacks: Ring the callbacks. Conference Rooms: Ring the conference rooms. DISA: Ring the DISA. Extensions: Ring the extensions. Fax To Mail: Ring the fax to mail. IVR Menus: Ring the IVR menus. Ring Group: Ring the ring group. Voicemails: Ring the voicemails. Other: Hang up the call.',
};
