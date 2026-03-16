// OpenVPN Constants
export const OPENVPN_LABELS = {
  title: 'OpenVPN Management',
  fileUpload: 'Upload OpenVPN Configuration File',
  status: 'VPN Status',
  logs: 'VPN Logs',
  operations: 'VPN Operations'
};

export const OPENVPN_BUTTONS = {
  UPLOAD_FILE: 'Upload File',
  START_VPN: 'Start VPN',
  STOP_VPN: 'Stop VPN',
  CHECK_STATUS: 'Check Status',
  REFRESH_LOGS: 'Refresh Logs'
};

export const OPENVPN_MESSAGES = {
  UPLOAD_SUCCESS: 'OpenVPN configuration file uploaded successfully!',
  UPLOAD_ERROR: 'Failed to upload OpenVPN configuration file',
  START_SUCCESS: 'OpenVPN started successfully!',
  START_ERROR: 'Failed to start OpenVPN',
  STOP_SUCCESS: 'OpenVPN stopped successfully!',
  STOP_ERROR: 'Failed to stop OpenVPN',
  STATUS_ERROR: 'Failed to get OpenVPN status',
  LOGS_ERROR: 'Failed to get OpenVPN logs',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server unavailable. Please try again later.'
};

export const OPENVPN_STATUS = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  UNKNOWN: 'Unknown'
};
