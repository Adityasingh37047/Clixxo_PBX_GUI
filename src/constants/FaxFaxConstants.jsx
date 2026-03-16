// constants/FaxFaxConstants.js

export const FAX_MODE_OPTIONS = [
  { value: 'T38', label: 'T38' },
  { value: 'T30', label: 'T30' },
];

export const FAX_FORM_INITIAL = {
  faxMode: 'T38',
  t38Version: 'default',
  t38Negotiation: 'Unsupported',
  maxFaxRate: '9600',
  faxTrainMode: 'transferredTCF',
  errorCorrectionMode: 't38UDPRedundancy',
  t30ECM: true
};

// Fields for T.38 mode
export const T38_FIELDS = [
  { name: 't38Version', label: 'T38 Version', type: 'select', options: ['default', '1', '2', '3'], defaultValue: 'default' },
  { name: 't38Negotiation', label: 'T38 Negotiation', type: 'select', options: ['Unsupported',
    'Initiate Negotiation as Fax Sender', 'Initiate Negotiation as Fax Receiver','Initiate Negotiation as Fax Anyone','Initiate Negotiation as Fax Voice'] },
  { name: 'maxFaxRate', label: 'Maximum Fax Rate (bps)', type: 'select', options: ['9600'] },
  { name: 'faxTrainMode', label: 'Fax Train Mode', type: 'select', options: ['transferredTCF', 'localTCF'] },
  { name: 'errorCorrectionMode', label: 'Error Correction Mode', type: 'select', options: ['t38UDPRedundancy', 't38UDPFEC'] },
  { name: 't30ECM', label: 'T30 ECM', type: 'checkbox' },
];
