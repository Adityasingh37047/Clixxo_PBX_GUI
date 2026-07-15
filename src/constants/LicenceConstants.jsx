export const LICENSE_API_TYPES = {
  INFO: "info",
  CHECK: "check",
  SYSTEM: "system",
};

export const LICENSE_PAGE_TITLE = "License";

export const LICENSE_BREADCRUMB = [
  "Maintenance",
  "System Tools",
  LICENSE_PAGE_TITLE,
];

export const LICENSE_CARD_TITLE = "License Management";

export const LICENSE_SECTION_TITLES = {
  INFORMATION: "License Information",
  SYSTEM_ID: "System ID",
  UPLOAD: "Upload License File",
  SUMMARY: "Current License Summary",
};

export const LICENSE_STATUS = {
  VALID: "VALID",
  INVALID: "INVALID",
  EXPIRED: "EXPIRED",
  UNKNOWN: "UNKNOWN",
};

export const LICENSE_STATUS_DISPLAY = {
  [LICENSE_STATUS.VALID]: {
    label: "Valid",
    color: "success",
    textColor: "#166534",
  },
  [LICENSE_STATUS.INVALID]: {
    label: "Invalid",
    color: "error",
    textColor: "#991b1b",
  },
  [LICENSE_STATUS.EXPIRED]: {
    label: "Expired",
    color: "warning",
    textColor: "#b45309",
  },
  [LICENSE_STATUS.UNKNOWN]: {
    label: "Unknown",
    color: "default",
    textColor: "#3E5475",
  },
};

export const LICENSE_DEVICE_TYPE_VALUES = {
  IPPBX: "IPPBX",
  FXS_GATEWAY: "FXS_GATEWAY",
};

export const LICENSE_DEVICE_TYPE_OPTIONS = [
  { value: LICENSE_DEVICE_TYPE_VALUES.IPPBX, label: "IPPBX" },
  { value: LICENSE_DEVICE_TYPE_VALUES.FXS_GATEWAY, label: "FXS Gateway" },
];

export const LICENSE_FORM_LABELS = {
  Serial_Number: "Serial Number",
  DEVICE_TYPE_MODE: "Device Type Mode",
  ACTIVATE_DATE: "Activation Date",
  EXPIRE_DATE: "Expiration Date",
  STATUS: "Status",
  SYSTEM_FINGERPRINT: "System ID",
  UPLOAD_FILE: "Upload License File",
  SELECTED_FILE: "Selected",
};

export const LICENSE_BUTTON_LABELS = {
  REFRESH_INFO: "Refresh Info",
  CHECK_VALIDITY: "Check Validity",
  GET_FINGERPRINT: "Get System ID",
  UPLOAD_LICENSE: "Upload License",
  SELECT_FILE: "Choose File",
  UPLOADING: "Uploading...",
};

export const LICENSE_BUTTON_VARIANTS = {
  PRIMARY: "primary",
  CANCEL: "cancel",
};

export const LICENSE_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: "6px 14px",
};

export const LICENSE_CHOOSE_FILE_BUTTON_STYLE = {
  ...LICENSE_BUTTON_STYLE,
  minWidth: 120,
};

export const LICENSE_PLACEHOLDERS = {
  SYSTEM_ID: "Click 'Get System ID' to retrieve system ID",
  NO_FILE: "No file chosen",
};

export const LICENSE_ERROR_MESSAGES = {
  FETCH_INFO_FAILED: "Failed to fetch license information",
  CHECK_VALIDITY_FAILED: "Failed to check license validity",
  GET_FINGERPRINT_FAILED: "Failed to get system fingerprint",
  UPLOAD_FAILED: "Failed to upload license file",
  INVALID_FILE: "Please select a valid license file",
  INVALID_DATA_FORMAT: "Invalid license data format",
  NETWORK_ERROR: "Network error occurred. Please try again.",
};

export const LICENSE_SUCCESS_MESSAGES = {
  INFO_FETCHED: "License information fetched successfully",
  VALIDITY_CHECKED: "License validity checked successfully",
  FINGERPRINT_FETCHED: "System fingerprint retrieved successfully",
  FILE_UPLOADED: "License file uploaded successfully",
};

export const LICENSE_DEFAULT_MESSAGE = { type: "", text: "" };

export const LICENSE_MESSAGE_TIMEOUT_MS = 5000;

export const LICENSE_FILE_INPUT = {
  ID: "license-file-input",
  ACCEPT: ".lic,.txt,.key",
};

export const LICENSE_TOOLTIPS = {
  [LICENSE_FORM_LABELS.Serial_Number]:
    "Unique serial number assigned to this system.",
  [LICENSE_FORM_LABELS.STATUS]:
    "Current license validation state. Use Check Validity to refresh.",
  [LICENSE_FORM_LABELS.ACTIVATE_DATE]:
    "Date when the current license was activated.",
  [LICENSE_FORM_LABELS.EXPIRE_DATE]:
    "Date when the current license expires.",
  [LICENSE_FORM_LABELS.DEVICE_TYPE_MODE]:
    "Operating mode for this device (IPPBX or FXS Gateway).",
  [LICENSE_FORM_LABELS.SYSTEM_FINGERPRINT]:
    "System fingerprint used for license generation. Copy and send to your vendor.",
  [LICENSE_FORM_LABELS.UPLOAD_FILE]:
    "Upload a valid license file (.lic, .txt, or .key) provided by your vendor.",
};

export const LICENSE_UPLOAD_INSTRUCTION =
  "Select a license file from your vendor, then upload to activate or update the license on this system.";

export const LICENSE_NOTE =
  "License changes may require a system restart to take full effect. Contact support if validation fails after upload.";
