import {
  TONE_DETECTER_INITIAL_FORM,
  TONE_DETECTER_TABLE_COLUMNS,
} from "../../../../constants/ToneDetecterConstants";

export const LOCAL_STORAGE_KEY = "toneDetectorRules";

export const TONE_DETECTER_DATA_COLUMNS = TONE_DETECTER_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

export const TONE_DETECTER_TONE_DEFAULTS = {
  "Dial Tone": {
    first_mid_frequency: "450",
    second_mid_frequency: "0",
    duration_on_state: "600",
    duration_off_state: "0",
    period_count: "0",
    duration_error: "20",
  },
  "Busy Tone": {
    first_mid_frequency: "450",
    second_mid_frequency: "0",
    duration_on_state: "350",
    duration_off_state: "350",
    period_count: "2",
    duration_error: "20",
  },
  "Ringback Tone": {
    first_mid_frequency: "450",
    second_mid_frequency: "0",
    duration_on_state: "1000",
    duration_off_state: "4000",
    period_count: "1",
    duration_error: "20",
  },
  "Fax F1": {
    first_mid_frequency: "1100",
    second_mid_frequency: "0",
    duration_on_state: "250",
    duration_off_state: "0",
    period_count: "0",
    duration_error: "20",
  },
  "Fax F2": {
    first_mid_frequency: "2100",
    second_mid_frequency: "0",
    duration_on_state: "250",
    duration_off_state: "0",
    period_count: "0",
    duration_error: "20",
  },
};

export function getToneDefaults(toneValue) {
  return TONE_DETECTER_TONE_DEFAULTS[toneValue] || {};
}

export function applyToneChange(prevFormData, toneValue) {
  const defaults = getToneDefaults(toneValue);
  return { ...prevFormData, tone: toneValue, ...defaults };
}

export function formFromItem(item) {
  return {
    ...item,
    index: item.index !== undefined ? String(item.index) : "0",
    first_mid_frequency:
      item.first_mid_frequency !== undefined
        ? String(item.first_mid_frequency)
        : "450",
    second_mid_frequency:
      item.second_mid_frequency !== undefined
        ? String(item.second_mid_frequency)
        : "0",
    duration_on_state:
      item.duration_on_state !== undefined
        ? String(item.duration_on_state)
        : "1500",
    duration_off_state:
      item.duration_off_state !== undefined
        ? String(item.duration_off_state)
        : "0",
    period_count:
      item.period_count !== undefined ? String(item.period_count) : "0",
    duration_error:
      item.duration_error !== undefined ? String(item.duration_error) : "20",
  };
}

export function getNextIndex(rules) {
  return rules.length > 0
    ? Math.max(...rules.map((r) => Number(r.index) || 0)) + 1
    : 0;
}

export function newFormForAdd(rules) {
  return {
    ...TONE_DETECTER_INITIAL_FORM,
    index: String(getNextIndex(rules)),
  };
}

export function normalizeToneDetecterForm(formData) {
  return {
    ...formData,
    index: String(formData.index || "0"),
    first_mid_frequency: String(formData.first_mid_frequency || "0"),
    second_mid_frequency: String(formData.second_mid_frequency || "0"),
    duration_on_state: String(formData.duration_on_state || "0"),
    duration_off_state: String(formData.duration_off_state || "0"),
    period_count: String(formData.period_count || "0"),
    duration_error: String(formData.duration_error || "20"),
  };
}

export function buildToneDetecterRule(formData, editIndex, rules) {
  const normalized = normalizeToneDetecterForm(formData);
  return {
    ...normalized,
    id: editIndex !== null ? rules[editIndex].id : Date.now(),
  };
}

export function parseStoredRules(stored) {
  if (!stored) return [];
  const parsed = JSON.parse(stored);
  return Array.isArray(parsed) ? parsed : [];
}
