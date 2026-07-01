export const PCM_TRUNK_INDEX_OPTIONS = Array.from({ length: 16 }, (_, i) => i);
export const PCM_TRUNK_PCM_NO_OPTIONS = Array.from({ length: 16 }, (_, i) => i);
export const PCM_TRUNK_TS_COUNT = 32;
export const PCM_TRUNK_ITEMS_PER_PAGE = 20;

export const PCM_TRUNK_INITIAL_FORM = {
  index: 0,
  pcmNo: 0,
  ts: Array(PCM_TRUNK_TS_COUNT).fill(true),
};

export const PCM_TRUNK_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const PCM_TRUNK_PAGE_BREADCRUMB_SECTION = "PCM";
export const PCM_TRUNK_PAGE_TITLE = "PCM Trunk";
export const PCM_TRUNK_EMPTY_MESSAGE = "No available PCM trunk!";
export const PCM_TRUNK_MODAL_TITLE = "PCM Trunk";
export const PCM_TRUNK_ADD_NEW_LABEL = "+ Add New";
export const PCM_TRUNK_SAVE_LABEL = "Save";
export const PCM_TRUNK_CLOSE_LABEL = "Close";

/** PCM Trunk (PcmTrunkPage) — local React state only */
export const PCM_TRUNK_FIELD_TOOLTIPS = {
  index: "Trunk index. Select 0–15. Stored in local table state. Default: 0.",
  pcmNo: "PCM number. Select 0–15. Stored in local table state. Default: 0.",
  ts:
    "32 time-slot checkboxes (TS[0]–TS[31]).\n" +
    "Check All toggles all slots. Stored in local table state. Default: all checked.",
};
