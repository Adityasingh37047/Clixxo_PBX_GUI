// Table columns for the main table view
export const COLOR_RING_TABLE_COLUMNS = [
  { key: "modify", label: "Modify" },
  { key: "check", label: "Check" },
  { key: "index", label: "Id" },
  { key: "description", label: "Description" },
  { key: "fileName", label: "Color Ring" },
];

// Index options (1-32)
export const COLOR_RING_INDEX_OPTIONS = Array.from({ length: 32 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

// Initial form state for the upload form
export const COLOR_RING_INITIAL_FORM = {
  index: "1",
  description: "default",
  file: null,
};

/** Color ring upload modal (ColorRingPage) — local table state */
export const COLOR_RING_FIELD_TOOLTIPS = {
  index:
    "Color ring profile ID (1–32). Select which slot this WAV file is assigned to.",
  description:
    "Description for this color ring entry. Required.\nCannot contain: % & ~ ! | ( ) ; \" ' = \\",
  file:
    "WAV audio file for custom ringback. Required on upload.\nOnly .wav files; maximum size 200 KB.",
};
