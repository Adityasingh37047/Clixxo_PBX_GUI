export const CERTIFICATE_PAGE_TITLE = 'Certificate Management';
export const CERTIFICATE_CARD_TITLE = CERTIFICATE_PAGE_TITLE;

export const CERTIFICATE_FIELDS = [
  { name: 'country', label: 'Country' },
  { name: 'province', label: 'Province' },
  { name: 'city', label: 'City' },
  { name: 'company', label: 'Company' },
  { name: 'department', label: 'Department' },
  { name: 'hostName', label: 'Host Name' },
  { name: 'email', label: 'Email' },
];

export const CERTIFICATE_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  CANCEL: 'cancel',
};

export const CERTIFICATE_BUTTON_LABELS = {
  GENERATE: 'Generate',
  RESET: 'Reset',
  DOWNLOAD: 'Download',
};

export const CERTIFICATE_BUTTON_CONFIG = [
  {
    name: 'generate',
    label: CERTIFICATE_BUTTON_LABELS.GENERATE,
    variant: CERTIFICATE_BUTTON_VARIANTS.PRIMARY,
  },
  {
    name: 'reset',
    label: CERTIFICATE_BUTTON_LABELS.RESET,
    variant: CERTIFICATE_BUTTON_VARIANTS.CANCEL,
  },
  {
    name: 'download',
    label: CERTIFICATE_BUTTON_LABELS.DOWNLOAD,
    variant: CERTIFICATE_BUTTON_VARIANTS.PRIMARY,
  },
];

export const CERTIFICATE_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 4,
  padding: '6px 14px',
  margin: 0,
  boxSizing: 'border-box',
};

export const CERTIFICATE_CANCEL_BUTTON_STYLE = {
  ...CERTIFICATE_BUTTON_STYLE,
  background: '#cbd5e1',
  color: '#374151',
  border: '1px solid #cbd5e1',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08)',
  borderRadius: 4,
};

export const CERTIFICATE_BREADCRUMB = [
  'Maintenance',
  'System Tools',
  CERTIFICATE_PAGE_TITLE,
];

export const CERTIFICATE_NOTE =
  'Note: Please restart the service to validate the configuration!';

export const CERTIFICATE_TOAST_DEFAULT = { msg: '', type: 'success' };
export const CERTIFICATE_TOAST_DURATION_MS = 3500;

export const CERTIFICATE_MESSAGES = {
  ACTION_SUCCESS: (action) => `${action} action triggered successfully`,
};

export const CERTIFICATE_TOOLTIPS = {
  country: 'Specifies the country of the certificate.',
  province: 'Specifies the province of the certificate.',
  city: 'Specifies the city of the certificate.',
  company: 'Specifies the company of the certificate.',
  department: 'Specifies the department of the certificate.',
  hostName: 'Specifies the host name of the certificate.',
  email: 'Specifies the email of the certificate.',
};
