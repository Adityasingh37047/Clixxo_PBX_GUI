export const LICENSE_API_TYPES = {
  INFO: 'info',
  CHECK: 'check',
  SYSTEM: 'system'
};

// License Status Constants
export const LICENSE_STATUS = {
  VALID: 'VALID',
  INVALID: 'INVALID',
  EXPIRED: 'EXPIRED',
  UNKNOWN: 'UNKNOWN'
};

// License Status Display
export const LICENSE_STATUS_DISPLAY = {
  [LICENSE_STATUS.VALID]: {
    label: 'Valid',
    color: 'success',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700'
  },
  [LICENSE_STATUS.INVALID]: {
    label: 'Invalid',
    color: 'error',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700'
  },
  [LICENSE_STATUS.EXPIRED]: {
    label: 'Expired',
    color: 'warning',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700'
  },
  [LICENSE_STATUS.UNKNOWN]: {
    label: 'Unknown',
    color: 'default',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  }
};

// Form Field Labels
export const LICENSE_FORM_LABELS = {
  Serial_Number: 'Serial Number',
  ACTIVATE_DATE: 'Activation Date',
  EXPIRE_DATE: 'Expiration Date',
  STATUS: 'Status',
  SYSTEM_FINGERPRINT: 'System ID',
  UPLOAD_FILE: 'Upload License File'
};

// Button Labels
export const LICENSE_BUTTON_LABELS = {
  REFRESH_INFO: 'Refresh Info',
  CHECK_VALIDITY: 'Check Validity',
  GET_FINGERPRINT: 'Get System ID',
  UPLOAD_LICENSE: 'Upload License',
  RESET: 'Reset'
};

// Error Messages
export const LICENSE_ERROR_MESSAGES = {
  FETCH_INFO_FAILED: 'Failed to fetch license information',
  CHECK_VALIDITY_FAILED: 'Failed to check license validity',
  GET_FINGERPRINT_FAILED: 'Failed to get system fingerprint',
  UPLOAD_FAILED: 'Failed to upload license file',
  INVALID_FILE: 'Please select a valid license file',
  NETWORK_ERROR: 'Network error occurred. Please try again.'
};

// Success Messages
export const LICENSE_SUCCESS_MESSAGES = {
  INFO_FETCHED: 'License information fetched successfully',
  VALIDITY_CHECKED: 'License validity checked successfully',
  FINGERPRINT_FETCHED: 'System fingerprint retrieved successfully',
  FILE_UPLOADED: 'License file uploaded successfully'
};