export const CUE_TONE_PAGE_BREADCRUMB_ROOT = "FXS";
export const CUE_TONE_PAGE_BREADCRUMB_SECTION = "Advanced";
export const CUE_TONE_PAGE_TITLE = "Cue Tone";
export const CUE_TONE_CARD_TITLE = "Upload";

export const CUE_TONE_NOTE_TEXT =
  "Note: The file should be a wav file with 8000Hz sampling rate, 16-bit mono, A-law formatted, and less than 200KB in size.";

export const CUE_TONE_FILE_TYPES = [
  { value: "0", label: "File of cue tone for IVR" },
  { value: "1", label: "Cue Tone of Call Waiting" },
];

export const CUE_TONE_INITIAL_FORM = {
  fileType: "0",
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
