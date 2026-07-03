// ================================
// SIP Account Generator Form Fields
// ================================

export const SIP_ACCOUNT_FORM_FIELDS = [
  {
    name: "sipTrunkNo",
    label: "SIP Trunk No.",
    type: "text",
    placeholder: "0",
    tooltip: "Specifies the SIP trunk number.",
    minWidth: 80,
  },
  {
    name: "registrationPeriod",
    label: "Registration Validity Period(s)",
    type: "text",
    placeholder: "1800",
    tooltip:
      "Specifies the registration validity period in seconds.",
    minWidth: 120,
  },
  {
    name: "registrationAddress",
    label: "Registration Address",
    type: "text",
    placeholder: "",
    tooltip: "Specifies the registration address.",
    flex: true,
  },
  {
    name: "description",
    label: "Description",
    type: "text",
    placeholder: "default",
    tooltip: "Specifies the description.",
    minWidth: 100,
  },
];

// ================================
// Notes
// ================================

export const SIP_ACCOUNT_NOTE =
  "*Please save and upload again after modification*";

// ================================
// Upload Section
// ================================

export const SIP_ACCOUNT_UPLOAD = {
  title: "Upload",
  instruction:
    "To upload a file, select it and click the button 'Upload' on the right to start.",
  prompt: "Please upload a file",
  chooseFile: "Choose File",
  noFile: "No file chosen",
  button: "Upload",
};

// ================================
// Download Section
// ================================

export const SIP_ACCOUNT_DOWNLOAD = {
  title: "Download",
  fileLabel: "File To Be Backup",
  fileName: "SIP Account File",
  instruction:
    "Please click the right mouse button to back up files to your computer!",
  button: "Download",
};

// ================================
// Buttons
// ================================

export const SIP_ACCOUNT_SAVE_BUTTON = "Save";

// ================================
// Toast Messages
// ================================

export const SIP_ACCOUNT_MESSAGES = {
  SAVE_SUCCESS: "SIP Account saved successfully",
  FILE_REQUIRED: "Please select a file to upload",
  UPLOAD_SUCCESS: "File uploaded successfully",
  DOWNLOAD_STARTED: "Download started",
};

// ================================
// Default Form Values
// ================================

export const SIP_ACCOUNT_DEFAULT_FORM = {
  sipTrunkNo: "0",
  registrationPeriod: "1800",
  registrationAddress: "",
  description: "default",
};

export const SIP_ACCOUNT_TOAST_DEFAULT = {
  msg: "",
  type: "success",
};

export const SIP_ACCOUNT_TOAST_DURATION = 3500;

// ================================
// Breadcrumb
// ================================

export const SIP_ACCOUNT_PAGE_TITLE = "SIP Account Generator";

export const SIP_ACCOUNT_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  SIP_ACCOUNT_PAGE_TITLE,
];