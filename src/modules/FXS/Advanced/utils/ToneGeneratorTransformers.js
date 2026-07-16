export function resetToneGeneratorForm(initialForm) {
  return { ...initialForm };
}

export const TONE_GENERATOR_HELP_BLOCKS = [
  {
    title: "350+440/0",
    text: "Continuously play a dual tone which is composed of 350HZ and 440HZ.Note: The value range of the frequency is 200~3500HZ.",
  },
  {
    title: "480+620/500,0/500",
    text: "Repeatedly play a dual tone which is composed of 480HZ and 620HZ in the method of 500ms play with 500ms pause. Note: 0/500 denotes 500ms silence and the tone cannot start with the silence.",
  },
  {
    title: "950/333,1400/333,1800/333,0/1000",
    text: "Repeatedly play tones in turn: first a 333ms 950HZ tone, followed by a 333ms 1400HZ tone, then a 333ms 1800HZ tone and at last a 1s silence.Note: The count of signals at ON state in a period cannot be greater than 4.",
  },
];
