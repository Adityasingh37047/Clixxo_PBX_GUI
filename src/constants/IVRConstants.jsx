export const IVR_TITLE = "IVR";

export const IVR_ENABLE_OPTIONS = ["Yes", "No"];
export const IVR_CHECK_VOICEMAIL_OPTIONS = ["Disable", "Enable"];
export const IVR_DIRECT_EXTENSION_OPTIONS = ["Disable", "Enable"];
export const IVR_FXO_FLASH_TRANSFER_OPTIONS = ["Disable", "Enable"];

export const IVR_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"];

export const IVR_TEXT_TARGET_TYPES = ["Custom", "DialByName", "FlashCustom"];

export const IVR_EMPTY_PROMPT_OPTIONS = { system: [], custom: [] };

export const IVR_EMPTY_RING_BACK_OPTIONS = {
  country_tones: [],
  moh_categories: [],
  custom_prompts: [],
};

export const IVR_MODAL_TABS = [
  { id: "basic", label: "BASIC" },
  { id: "keypress", label: "KEY PRESS EVENT" },
];

/** Field tooltips for IVR */
export const IVR_FIELD_TOOLTIPS = {
  name:
    "User-defined IVR name. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_only.",

  ivr_number:
    "The extension number dialed to reach this IVR. Range of value: 6500-6599. You can modified in the submenu preference in the menu PBX.",

  greet_long:
    "It is played as the first prompt for entering the IVR menu. The default setting is default.",

  greet_short:
    "It is played when the user doesn't enter any key or enters a wrong key. By default it is null.",

  response_timeout:
    "The number of milliseconds to wait for a digit input after prompt, in miliseconds. If no DTMF is received, it will repeat the prompt according to the Max Timeouts settings until it has finished the rrepeat. After that, call will go to the Timeout destination set in options. Default is 10000.",

  password: "Set IVR password, default is 0000.",

  check_voicemail:
    "If enabled, the caller will be allowed to dial feature code: Voicemail main menu to check voicemail.",

  direct_outbound:
    "Set whether the user can dial directly out after hearing the IVR prompt. By default it is unticked.",

  inter_digit_timeout:
    "The maximum time between your entering of two adjacent DTMF digits. The default value is 3000ms.",

  max_failures:
    "The maximum number of failed attempts before the IVR is considered to have failed. The default setting is 3.",

  max_timeouts:
    "The maximum number of timeouts before the IVR is considered to have failed. The default setting is 3.",

  digit_length:
    "The length of the digits to be entered by the caller. The default setting is 4.",

  enabled:
    "Enable the IVR to be used. The default setting is unticked.",

  direct_extension:
    "Enable direct extension to allow calls to be placed through direct extension without additional restrictions.",

  fxo_flash_transfer:
    "Enable FXO flash transfer to allow calls to be placed through FXO flash transfer without additional restrictions.",

  invalid_sound:
    "The sound to play when the caller enters an invalid digit. The default setting is null.",

  exit_sound:
    "The sound to play when the caller exits the IVR. The default setting is null.",

  exit_action:
    "The action to take when the caller exits the IVR. The default setting is null.",

  ring_back:
    "The sound to play when the caller is ringing back. The default setting is null.",

  caller_id_name_prefix:
    "The prefix to add to the caller ID name. The default setting is null.",

  exit_destination:
    "The destination to call when the caller exits the IVR. The default setting is null.",
};
