export const SIP_SETTINGS_PAGE_BREADCRUMB_ROOT = "System";
export const SIP_SETTINGS_PAGE_BREADCRUMB_SECTION = "System Settings";
export const SIP_SETTINGS_PAGE_TITLE = "SIP Settings";
export const SIP_SETTINGS_CARD_TITLE = "SIP Settings";

export const SIP_SETTINGS_BTN_SAVE = "Save";
export const SIP_SETTINGS_BTN_RESET = "Reset";
export const SIP_SETTINGS_BTN_CANCEL = "Cancel";
export const SIP_SETTINGS_BTN_UPLOAD = "Upload";
export const SIP_SETTINGS_BTN_GENERATE = "Generate Certificate";
export const SIP_SETTINGS_BTN_GENERATING = "Generating...";
export const SIP_SETTINGS_BTN_UPLOAD_CONFIRM = "Upload";
export const SIP_SETTINGS_BTN_UPLOADING = "Uploading...";
export const SIP_SETTINGS_BTN_DOWNLOAD = "Download";
export const SIP_SETTINGS_BTN_DOWNLOADING = "Downloading...";
export const SIP_SETTINGS_BTN_CHOOSE_FILE = "Choose File";
export const SIP_SETTINGS_NO_FILE_CHOSEN = "No file chosen";
export const SIP_SETTINGS_LABEL_CERTIFICATE = "Certificate";
export const SIP_SETTINGS_LABEL_PRIVATE_KEY = "Private Key";
export const SIP_SETTINGS_BTN_SAVING = "Saving...";
export const SIP_SETTINGS_LOADING_TEXT = "Loading SIP settings...";
export const SIP_SETTINGS_MODAL_UPLOAD_TITLE = "Upload Certificate and Key";

export const SIP_SETTINGS_SECTION_TLS = "Enable TLS";
export const SIP_SETTINGS_SECTION_WEBRTC = "Enable WebRTC";
export const SIP_SETTINGS_SECTION_CERTIFICATE = "Certificate";
export const SIP_SETTINGS_CURRENT_CERT_TITLE = "Current Certificate";
export const SIP_SETTINGS_CURRENT_CERT_SUBJECT = "Subject";
export const SIP_SETTINGS_CURRENT_CERT_VALID = "Valid";
export const SIP_SETTINGS_CURRENT_CERT_COVERS = "Covers";
export const SIP_SETTINGS_CURRENT_CERT_VIRTUAL_IP = "Virtual IP";
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
  certificate: "Select the TLS certificate file (.crt, .cer, or .pem).",
  privateKey: "Select the matching private key file (.key or .pem). Required with the certificate.",
  uploadCertificate:
    "Upload TLS certificate and private key for SIP TLS. Both files are required.",
  downloadCertificate:
    "Download the currently uploaded TLS certificate and private key as a zip file.",
  generateCertificate:
    "Generate a new self-signed TLS certificate and private key on the PBX.",
};

export const SIP_SETTINGS_MESSAGES = {
  loadFailed: "Failed to load SIP settings.",
  saveSuccess: "TLS/WebRTC settings saved.",
  saveFailed: "Failed to save SIP settings.",
  resetSuccess: "SIP settings reset.",
  uploadSuccess: "Certificate and key uploaded.",
  uploadFailed: "Failed to upload certificate.",
  generateSuccess: "Certificate generated successfully.",
  generateFailed: "Failed to generate certificate.",
  downloadSuccess: "Certificate downloaded successfully.",
  downloadFailed: "Failed to download certificate.",
  certRequired: "Please select a certificate file to upload.",
};
