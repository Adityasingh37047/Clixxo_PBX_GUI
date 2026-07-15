import {
  DTMF_TAB_DETECTOR,
  DTMF_TAB_GENERATOR,
} from "../../../../constants/DtmfConstants";

export const GENERATOR_FIELD_KEYS = new Set([
  "dtmfEnergyAdvance",
  "dtmfPlayEnergy",
  "dtmfTxHighDuration",
  "dtmfTxLowDuration",
  ...Array.from({ length: 12 }, (_, i) => `dtmfPlayEnergy${i}`),
  ...Array.from({ length: 12 }, (_, i) => `dtmfHighPlayEnergy${i}`),
]);

export function getTabForField(fieldName) {
  return GENERATOR_FIELD_KEYS.has(fieldName)
    ? DTMF_TAB_GENERATOR
    : DTMF_TAB_DETECTOR;
}

export function resetDtmfForm(initialForm) {
  return { ...initialForm };
}
