export const PCM_TRUNK_INDEX_OPTIONS = Array.from({ length: 16 }, (_, i) => i);
export const PCM_TRUNK_PCM_NO_OPTIONS = Array.from({ length: 16 }, (_, i) => i);
export const PCM_TRUNK_TS_COUNT = 32;
export const PCM_TRUNK_ITEMS_PER_PAGE = 20;

export const PCM_TRUNK_INITIAL_FORM = {
  index: 0,
  pcmNo: 0,
  ts: Array(PCM_TRUNK_TS_COUNT).fill(true),
};
