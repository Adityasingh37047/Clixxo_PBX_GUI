// SIP Account Generator Form Field Constants
export const SIP_ACCOUNT_FIELDS = [
  { label: 'SIP Trunk No.', name: 'sipTrunkNo', type: 'text', placeholder: '0' },
  { label: 'Registration Validity Period(s):', name: 'registrationPeriod', type: 'text', placeholder: '1800' },
  { label: 'Registration Address:', name: 'registrationAddress', type: 'text', placeholder: '' },
  { label: 'Description:', name: 'description', type: 'text', placeholder: 'default' },
];

export const SIP_ACCOUNT_NOTE = '*Please save and upload again after modification*';

export const SIP_ACCOUNT_UPLOAD = {
  title: 'Upload',
  instruction: "To upload a file, select it and click the button 'Upload' on the right to start.",
  prompt: 'Please upload a file',
  chooseFile: 'Choose File',
  noFile: 'No file chosen',
  button: 'Upload',
};

export const SIP_ACCOUNT_DOWNLOAD = {
  title: 'DownLoad',
  fileLabel: 'File To Be Backup',
  fileName: 'SIP Account File',
  instruction: 'Please click the right mouse button to back up files to your computer!',
  button: 'Download',
};

export const SIP_ACCOUNT_SAVE_BUTTON = 'Save';
