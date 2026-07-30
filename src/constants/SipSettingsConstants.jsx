export const SIP_SETTINGS_PAGE_BREADCRUMB_ROOT = "System";
export const SIP_SETTINGS_PAGE_BREADCRUMB_SECTION = "System Settings";
export const SIP_SETTINGS_PAGE_TITLE = "SIP Settings";
export const SIP_SETTINGS_CARD_TITLE = "SIP Settings";

export const SIP_SETTINGS_BTN_SAVE = "Save";
export const SIP_SETTINGS_BTN_RESET = "Reset";
export const SIP_SETTINGS_BTN_UPLOAD = "Upload Certificate";
export const SIP_SETTINGS_BTN_UPLOADING = "Uploading...";
export const SIP_SETTINGS_BTN_DOWNLOAD = "Download";
export const SIP_SETTINGS_BTN_DOWNLOADING = "Downloading...";
export const SIP_SETTINGS_BTN_CHOOSE_FILE = "Choose File";
export const SIP_SETTINGS_NO_FILE_CHOSEN = "No file chosen";
export const SIP_SETTINGS_LABEL_CERTIFICATE = "Certificate";
export const SIP_SETTINGS_LABEL_PRIVATE_KEY = "Private Key (Optional)";
export const SIP_SETTINGS_BTN_SAVING = "Saving...";
export const SIP_SETTINGS_LOADING_TEXT = "Loading SIP settings...";

export const SIP_SETTINGS_SECTION_TLS = "Enable TLS";
export const SIP_SETTINGS_SECTION_WEBRTC = "Enable WebRTC";
export const SIP_SETTINGS_SECTION_CERTIFICATE = "Upload Certificate";
export const SIP_SETTINGS_LABEL_ENABLE = "Enable";
export const SIP_SETTINGS_SECTION_HEADING_LEFT = -20;

export const SIP_SETTINGS_TLS_VERSION_OPTIONS = [
  "TLSv1",
  "TLSv1.2",
  "TLSv1.3"
];

export const SIP_SETTINGS_YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const SIP_SETTINGS_INITIAL_FORM = {
  enableTls: false,
  tlsSipPort: "5061",
  tlsVersion: "TLSv1.2",
  verifyClient: "no",
  requireClientCert: "no",
  tlsBindAddress: "0.0.0.0",
  enableWebrtc: false,
  wsPort: "5066",
  wssPort: "7443",
  bindAddress: "0.0.0.0",
};

export const SIP_SETTINGS_FIELD_TOOLTIPS = {
  enableTls: "Enable SIP signaling over TLS.",
  tlsSipPort: "Port used for SIP TLS signaling.",
  tlsVersion: "TLS protocol version for SIP connections.",
  verifyClient: "Verify the TLS client certificate when a client connects.",
  requireClientCert: "Require clients to present a valid TLS certificate.",
  tlsBindAddress: "Select the local IP address or interface for TLS binding.",
  enableWebrtc: "Enable WebRTC support for browser-based clients.",
  wsPort: "WebSocket port for WebRTC signaling.",
  wssPort: "Secure WebSocket (WSS) port for WebRTC signaling.",
  bindAddress: "Select the local IP address or interface for WebRTC binding.",
  uploadCertificate:
    "Upload TLS certificate and optional private key for SIP TLS.",
};

export const SIP_SETTINGS_MESSAGES = {
  loadFailed: "Failed to load SIP settings.",
  saveSuccess: "SIP settings saved successfully.",
  saveFailed: "Failed to save SIP settings.",
  uploadSuccess: "Certificate uploaded successfully.",
  uploadFailed: "Failed to upload certificate.",
  downloadSuccess: "Certificate downloaded successfully.",
  downloadFailed: "Failed to download certificate.",
  certRequired: "Please select a certificate file to upload.",
};
