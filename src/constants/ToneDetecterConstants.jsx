// Table columns for the main table view
export const TONE_DETECTER_PAGE_BREADCRUMB_ROOT = "FXS";
export const TONE_DETECTER_PAGE_BREADCRUMB_SECTION = "Advanced";
export const TONE_DETECTER_PAGE_TITLE = "Tone Detector";
export const TONE_DETECTER_CARD_TITLE = "Tone Detector";
export const TONE_DETECTER_EMPTY_MESSAGE = "No available tone detector parameter!";
export const TONE_DETECTER_ITEMS_PER_PAGE = 20;
export const TONE_DETECTER_MODAL_TITLE_ADD = "Add Tone Parameters";
export const TONE_DETECTER_MODAL_TITLE_EDIT = "Edit Tone Parameters";

export const TONE_DETECTER_TABLE_COLUMNS = [
  { key: 'modify', label: 'Modify' },
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'Index' },
  { key: 'tone', label: 'Tone' },
  { key: 'first_mid_frequency', label: 'The 1st Mid-frequency' },
  { key: 'second_mid_frequency', label: 'The 2nd Mid-frequency' },
  { key: 'duration_on_state', label: 'Duration at ON State' },
  { key: 'duration_off_state', label: 'Duration at OFF State' },
  { key: 'period_count', label: 'Period Count' },
  { key: 'duration_error', label: 'Duration Error at ON/OFF State(ms)' },
];

// Form fields for the modal
export const TONE_DETECTER_FIELDS = [
  { name: 'index', label: 'Index:', type: 'number' },
  { name: 'tone', label: 'Tone:', type: 'select', options: [
    { value: 'Dial Tone', label: 'Dial Tone' },
    { value: 'Busy Tone', label: 'Busy Tone' },
    { value: 'Ringback Tone', label: 'Ringback Tone' },
    { value: 'Fax F1', label: 'Fax F1' },
    { value: 'Fax F2', label: 'Fax F2' },
  ] },
  { name: 'first_mid_frequency', label: 'The 1st Mid-frequency:', type: 'number' },
  { name: 'second_mid_frequency', label: 'The 2nd Mid-frequency:', type: 'number' },
  { name: 'duration_on_state', label: 'Duration at ON State:', type: 'number' },
  { name: 'duration_off_state', label: 'Duration at OFF State:', type: 'number' },
  { name: 'period_count', label: 'Period Count:', type: 'number' },
  { name: 'duration_error', label: 'Duration Error at ON/OFF State(ms):', type: 'number' },
];

// Initial form state for the modal
export const TONE_DETECTER_INITIAL_FORM = {
  index: 0,
  tone: 'Dial Tone',
  first_mid_frequency: '450',
  second_mid_frequency: '0',
  duration_on_state: '1500',
  duration_off_state: '0',
  period_count: '0',
  duration_error: '20',
};

const toneDetecterOpts = (field) => {
  if (!field.options) return "";
  return `Options: ${field.options.map((o) => o.label).join(", ")}.`;
};

const buildToneDetecterFieldTooltips = () => {
  const tooltips = {};
  TONE_DETECTER_FIELDS.forEach((field) => {
    const parts = [];
    if (field.type === "select") {
      parts.push(toneDetecterOpts(field));
      parts.push("Changing tone type auto-fills frequency and duration defaults.");
    } else if (field.name === "index") {
      parts.push("Tone detector profile index. Auto-incremented when adding.");
    } else {
      parts.push("Numeric parameter for tone detection.");
    }
    tooltips[field.name] = parts.join("\n");
  });
  tooltips.tone += "\nRequired. Dial Tone, Busy Tone, Ringback Tone, Fax F1, or Fax F2.";
  tooltips.first_mid_frequency += "\nRequired. Primary mid-frequency (Hz). Default varies by tone type.";
  tooltips.second_mid_frequency +=
    "\nSecondary mid-frequency (Hz). Use 0 for single-frequency tones.";
  tooltips.duration_on_state += "\nTone ON duration (ms).";
  tooltips.duration_off_state += "\nTone OFF duration (ms).";
  tooltips.period_count += "\nNumber of ON/OFF periods in detection window.";
  tooltips.duration_error += "\nRequired. Allowed timing error at ON/OFF transitions (ms). Default: 20.";
  return tooltips;
};

/** Tone detector modal (ToneDetecterPage) — localStorage table state */
export const TONE_DETECTER_FIELD_TOOLTIPS = buildToneDetecterFieldTooltips();

