export const DTMF_PAGE_BREADCRUMB_ROOT = "FXS";
export const DTMF_PAGE_BREADCRUMB_SECTION = "Advanced";
export const DTMF_PAGE_TITLE = "DTMF";
export const DTMF_CARD_TITLE = "DTMF";
export const DTMF_DETECTOR_TAB = "DTMF Detector";
export const DTMF_GENERATOR_TAB = "DTMF Generator";
export const DTMF_TAB_DETECTOR = "detector";
export const DTMF_TAB_GENERATOR = "generator";
export const DTMF_SAVE_LABEL = "Save";
export const DTMF_RESET_LABEL = "Reset";
export const DTMF_GENERATOR_WARNING =
  "Note: Setting the DTMF transmission energy too large may cause the distortion of the transmitted DTMF. Please configure it carefully.";

// Initial form state for DTMF
export const DTMF_INITIAL_FORM = {
  // DTMF Detector
  positiveTwist: '5',
  negativeTwist: '9',
  minDuration: '23',
  minNegativeDuration: '36',
  energyRatio: '83.8',
  levelMinIn: '-21',
  enableDisplayDtmf: false,
  enableOmitABCD: false,
  
  // DTMF Generator
  dtmfEnergyAdvance: false,
  dtmfPlayEnergy: '-3',
  dtmfTxHighDuration: '80',
  dtmfTxLowDuration: '60',
  
  // Advanced Energy Settings (hidden by default)
  dtmfPlayEnergy0: '-3',
  dtmfHighPlayEnergy0: '-3',
  dtmfPlayEnergy1: '-3',
  dtmfHighPlayEnergy1: '-3',
  dtmfPlayEnergy2: '-3',
  dtmfHighPlayEnergy2: '-3',
  dtmfPlayEnergy3: '-3',
  dtmfHighPlayEnergy3: '-3',
  dtmfPlayEnergy4: '-3',
  dtmfHighPlayEnergy4: '-3',
  dtmfPlayEnergy5: '-3',
  dtmfHighPlayEnergy5: '-3',
  dtmfPlayEnergy6: '-3',
  dtmfHighPlayEnergy6: '-3',
  dtmfPlayEnergy7: '-3',
  dtmfHighPlayEnergy7: '-3',
  dtmfPlayEnergy8: '-3',
  dtmfHighPlayEnergy8: '-3',
  dtmfPlayEnergy9: '-3',
  dtmfHighPlayEnergy9: '-3',
  dtmfPlayEnergy10: '-3', // *
  dtmfHighPlayEnergy10: '-3',
  dtmfPlayEnergy11: '-3', // #
  dtmfHighPlayEnergy11: '-3',
};

const dtmfDigitLabel = (i) => {
  if (i === 10) return "*";
  if (i === 11) return "#";
  return String(i);
};

const buildDtmfFieldTooltips = () => {
  const tooltips = {
    positiveTwist:
      "Energy difference (dB) for high-frequency minus low-frequency detection.\nValid range: 0~24.",
    negativeTwist:
      "Energy difference (dB) for low-frequency minus high-frequency detection.\nValid range: 0~24.",
    minDuration:
      "Minimum tone duration at ON state (ms) for DTMF detection.\nValid range: 10~2000.",
    minNegativeDuration:
      "Minimum tone duration at OFF state (ms) for DTMF detection.\nValid range: 10~2000.",
    energyRatio:
      "Ratio of dual-tone energy (%).\nValid range: 1~100. Allows one decimal place.",
    levelMinIn:
      "Lowest energy threshold (dB) for accepting a digit.\nValid range: -40~-9.",
    enableDisplayDtmf:
      "When enabled, detected DTMF digits are reported via channel status.",
    enableOmitABCD:
      "When enabled, ABCD DTMF detection is omitted.",
    dtmfEnergyAdvance:
      "When enabled, per-digit low/high energy levels (0–9, *, #) replace the single DTMF Energy field.",
    dtmfPlayEnergy:
      "DTMF transmit energy (dB) when Advanced Energy Set is off.\nValid range: -18~11 dB.",
    dtmfTxHighDuration:
      "DTMF transmit duration at ON state (ms).\nValid range: 0~16383.",
    dtmfTxLowDuration:
      "DTMF transmit duration at OFF state (ms).\nValid range: 0~16383.",
  };

  for (let i = 0; i <= 11; i++) {
    const digit = dtmfDigitLabel(i);
    tooltips[`dtmfPlayEnergy${i}`] =
      `DTMF${digit} low-frequency transmit energy (dB).\nValid range: -18.0~11.0 dB; one decimal place max.\nShown when DTMF Energy Advance Set is enabled.`;
    tooltips[`dtmfHighPlayEnergy${i}`] =
      `DTMF${digit} high-frequency transmit energy (dB).\nValid range: -18.0~11.0 dB; one decimal place max.\nShown when DTMF Energy Advance Set is enabled.`;
  }

  return tooltips;
};

/** DTMF detector/generator (DtmfPage) — local form state */
export const DTMF_FIELD_TOOLTIPS = buildDtmfFieldTooltips();
