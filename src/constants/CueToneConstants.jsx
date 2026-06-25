// File type options for the dropdown
export const CUE_TONE_FILE_TYPES = [
  { value: '0', label: 'File of cue tone for IVR' },
  { value: '1', label: 'Cue Tone of Call Waiting' },
];

// Initial form state
export const CUE_TONE_INITIAL_FORM = {
  fileType: '0',
  file: null,
};

/** Cue Tone page */
export const CUE_TONE_FIELD_TOOLTIPS = {
  fileType:
    "Target cue-tone slot for the uploaded audio file.\n" +
    "State key: fileType. Default: 0.\n" +
    "Options: 0 File of cue tone for IVR, 1 Cue Tone of Call Waiting.",

  file:
    "WAV file to upload for the selected cue-tone type.\n" +
    "State key: file (File object). File picker accepts .wav only.\n" +
    "Upload validation: file required, .wav extension, size under 200 KB.\n" +
    "Audio must be 8000 Hz, 16-bit mono, A-law formatted.",
};
