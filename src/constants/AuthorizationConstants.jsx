export const DEFAULT_SERIAL = '';
export const AUTH_STATUS = {
  AUTHORIZED: 'Authorized',
  UNAUTHORIZED: 'Unauthorized',
};

export const AUTH_BREADCRUMB_ROOT = "Maintenance";
export const AUTH_BREADCRUMB_SECTION = "System Tool";
export const AUTH_PAGE_TITLE = "Authorization";
export const AUTH_BREADCRUMB_SEPARATOR = ">";

export const AUTH_BTN_REFRESH = "Refresh";
export const AUTH_BTN_LOADING = "Loading...";
export const AUTH_LICENSE_NOTE =
  "Note - The information above is a summary of your license. For any change, contact your vendor or authorized supplier.";

export const AUTH_CARD_TITLE = "Authorization Information";

export const DEFAULT_DEVICE_TYPE = "IPPBX";
export const DEFAULT_EXPIRY_DATE = "2027-04-10";
export const DEFAULT_MAX_E1_PRI = "2";

export const AUTH_ERROR_LOAD_FAILED = "Failed to load license information.";

export const AUTH_LABEL_SERIAL = "Serial Number:";
export const AUTH_LABEL_STATUS = "Authorization Status:";
export const AUTH_LABEL_DEVICE_TYPE = "Device Type:";
export const AUTH_LABEL_EXPIRY_DATE = "Expiry Date:";
export const AUTH_LABEL_SIP_EXTENSIONS =
  "Maximum Number of SIP Extensions:";
export const AUTH_LABEL_FXS_CHANNELS =
  "Maximum Number of FXS Channels:";
export const AUTH_LABEL_FXO_CHANNELS =
  "Maximum Number of FXO Channels:";
export const AUTH_LABEL_SIP_TRUNK_CHANNELS =
  "Maximum Number of SIP Trunk Channels:";
export const AUTH_LABEL_E1_PRI =
  "Maximum Number of E1-PRI:";

export const AUTH_TOOLTIPS = {
  [AUTH_LABEL_SERIAL]:
    "Displays the unique serial number assigned to this device.",
  [AUTH_LABEL_STATUS]:
    "Shows the current authorization or license status of the device.",
  [AUTH_LABEL_DEVICE_TYPE]:
    "Displays the model or type of the device.",
  [AUTH_LABEL_EXPIRY_DATE]:
    "Shows the date on which the current authorization or license expires.",
  [AUTH_LABEL_SIP_EXTENSIONS]:
    "Displays the maximum number of SIP extensions supported by this device.",
  [AUTH_LABEL_FXS_CHANNELS]:
    "Displays the maximum number of FXS channels supported by this device.",
  [AUTH_LABEL_FXO_CHANNELS]:
    "Displays the maximum number of FXO channels supported by this device.",
  [AUTH_LABEL_SIP_TRUNK_CHANNELS]:
    "Displays the maximum number of SIP trunk channels supported by this device.",
  [AUTH_LABEL_E1_PRI]:
    "Displays the maximum number of E1-PRI interfaces supported by this device.",
};
