export const CONFERENCE_TITLE = "Conference";

export const CONFERENCE_ENABLE_OPTIONS = ["Yes", "No"];
export const CONFERENCE_YES_NO_OPTIONS = ["Yes", "No"];

export const CONFERENCE_DEFAULT_MAX_MEMBERS = "20";

export const CONFERENCE_MODAL_TABS = [
  { id: "basic", label: "BASIC" },
  { id: "advanced", label: "ADVANCED SETTINGS" },
];

export const CONFERENCE_MODERATOR_NOTE =
  "Note: Selecting an extension group will include all members in that group when a moderator dials this conference number.";

/** Field tooltips for Conference */
export const CONFERENCE_FIELD_TOOLTIPS = {
  room_name:
    "The number dialed to reach this conference room, with the default value ranges of 6400~6499 which can be modified in 'PBX->Preference->Extension Preferences'. It is null by default and must be filled in: otherwise the configuration will fail to be saved.",

  conference_number:
    "The conference number is the number that will be used to dial into the conference.",

  greeting:
    "The greeting played upon joining this conference room. The default setting is default.",

  announce:
    "If set to Yes, other members will hear prompts upon a memd=ber enters or exits this conference room: if set to No, there will be no prompt for a member's entering or exiting. The default setting is No.",

  record: "Set whether to enable the recording. The default setting is No.",

  enabled:
    "Set whether to use this conference room. The default setting is Yes.",

  schedule_start:
    "The start time of the conference room. The default setting is null.",

  schedule_end:
    "The end time of the conference room. The default setting is null.",

  pin: "Enter the PIN that users must provide to access or use this feature.",

  max_members:
    "Specify the maximum number of participants allowed in the conference room.",

  wait_for_moderator:
    "If set to Yes, the participants could not hear each other until the moderator joins the conference. the default setting is Yes.",

  say_your_name:
    "If set to  Yes, you will hear a propmt'Please say yur name' upon you enter a conference room, and other members will hear a prompt 'XXX enters the conference' upon you successfully join in the conference. The default setting is Yes.",

  mute_participant:
    'If set  to Yes, the participants expect for the moderator are not allowed to speak in this conference room."The default setting is No',

  allow_participant_invite:
    "If set to Yes, all participants could press *0 to invite other users to enter this conference room, press *1 to launch an invitation with confirmation request and press 82 to kick the member they invited out of this room. The administrator could press *3 to kick out all participants in the conference. the default setting is Yes.",
};
