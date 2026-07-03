export const CERTIFICATE_FIELDS = [
  { name: 'country', label: 'Country' },
  { name: 'province', label: 'Province' },
  { name: 'city', label: 'City' },
  { name: 'company', label: 'Company' },
  { name: 'department', label: 'Department' },
  { name: 'hostName', label: 'Host Name' },
  { name: 'email', label: 'Email' },
];

export const CERTIFICATE_BUTTONS = [
  { name: 'generate', label: 'Generate' },
  { name: 'reset', label: 'Reset' },
  { name: 'download', label: 'Download' },
];



export const CERTIFICATE_CARD_TITLE = "Certificate Management";

export const CERTIFICATE_BREADCRUMB = [
  "Maintenance",
  "System Tool",
  CERTIFICATE_CARD_TITLE,
];

export const CERTIFICATE_NOTE = 'Note: Please restart the service to validate the configuration!';

export const CERTIFICATE_TOAST_DEFAULT = { msg: "", type: "success" };
export const CERTIFICATE_TOAST_DURATION = 3500;
export const CERTIFICATE_MESSAGES = {
  ACTION_SUCCESS: (action) =>
    `${action} action triggered successfully`,
};


export const CERTIFICATE_TOOLTIPS = {
  country: "Specifies the country of the certificate.",
  province: "Specifies the province of the certificate.",
  city: "Specifies the city of the certificate.",
  company: "Specifies the company of the certificate.",
  department: "Specifies the department of the certificate.",
  hostName: "Specifies the host name of the certificate.",
  email: "Specifies the email of the certificate.",
};

export const PRIMARY_CERTIFICATE_ACTIONS = [
  "generate",
  "download",
];