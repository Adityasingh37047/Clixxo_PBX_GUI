export const DISA_ITEMS_PER_PAGE = 20;

export const DISA_TITLE = 'DISA';

export const DISA_SECOND_DIAL_OPTIONS = ['Enable', 'Disable'];

export const DISA_TRANSPARENT_OPTIONS = ['Enable', 'Disable'];

export const DISA_ENABLE_OPTIONS = ['Yes', 'No'];

export const DISA_PIN_TYPE_OPTIONS = ['None', 'Single Pin'];

/** Field tooltips for DISA */
export const DISA_FIELD_TOOLTIPS = {
  name:
    'User-defined name of a DISA. It must be filled in: otherwise the configuration will fail to be saved. You can user letters, digits, chinese,_ only. Maximum 32 characters.',

  response_timeout:
    'The timeout time to ring next extension, and also the timeout time to enter Timeout destination if all extensions are unavailable. The default value is 10s.',

  digit_timeout:
    'The timeout time to ring next extension, and also the timeout time to enter Timeout destination if all extensions are unavailable. The default value is 5s.',

  second_dial:
    'Select the action to perform when the second dial is received. Enable: The second dial is enabled. Disable: The second dial is disabled.',

  transparent:
    'Select the action to perform when the transparent is received. Enable: The transparent is enabled. Disable: The transparent is disabled.',

  pin_type:
    'Select the type of PIN. None: No PIN is required. Single Pin: A single PIN is required.',

  enabled:
    'Set whether to enable this DISA. Yes: The DISA is enabled. No: The DISA is disabled.',

  outbound_routes:
    'Select the outbound routes available through this DISA. Routes are tried in the order shown in the Selected list.',
};
