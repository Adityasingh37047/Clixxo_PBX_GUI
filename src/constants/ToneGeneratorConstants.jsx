// Initial form state
export const TONE_GENERATOR_INITIAL_FORM = {
  dialTone: '450/0',
  ringbackTone: '450/1000,0/4000',
  busyTone: '450/350,0/350',
};

const toneParamTooltip = (name, example) =>
  `${name} transmitter pattern.\nFormat: freq/Duration_ms segments separated by commas.\nFrequency: 200~3500 Hz (or dual freq1+freq2). Use 0 for silence.\nMax 4 ON-state signals per period; tone cannot start with silence.\nExample: ${example}`;

/** Tone generator (ToneGeneratorPage) — local form state */
export const TONE_GENERATOR_FIELD_TOOLTIPS = {
  dialTone: toneParamTooltip("Dial tone", "450/0 or 350+440/0"),
  ringbackTone: toneParamTooltip("Ringback tone", "450/1000,0/4000"),
  busyTone: toneParamTooltip("Busy tone", "450/350,0/350"),
};

