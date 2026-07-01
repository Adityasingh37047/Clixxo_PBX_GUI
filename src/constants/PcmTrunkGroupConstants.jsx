// PCM Trunk Group modal fields and initial state

export const PCM_TRUNK_GROUP_FIELDS = [
  {
    name: 'groupId',
    label: 'Group ID',
    type: 'select',
    options: Array.from({ length: 256 }, (_, i) => ({ value: i, label: i.toString() })),
  },
  {
    name: 'description',
    label: 'Description',
    type: 'text',
    placeholder: 'Testing',
  },
  // PSTN IDs handled separately as checkboxes
];

export const PCM_TRUNK_GROUP_INITIAL_FORM = {
  groupId: 0,
  description: 'Testing',
  pstnIds: [], // from spans
};

export const PCM_TRUNK_GROUP_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'groupId', label: 'Group ID' },
  { key: 'pstnIds', label: 'PSTN IDs' },
  { key: 'description', label: 'Description' },
  { key: 'modify', label: 'Modify' },
];

export const PCM_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const PCM_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION = "PCM";
export const PCM_TRUNK_GROUP_PAGE_TITLE = "PCM Trunk Group";
export const PCM_TRUNK_GROUP_EMPTY_MESSAGE = "No PCM Trunk Groups found.";
export const PCM_TRUNK_GROUP_MODAL_TITLE_ADD = "Add PCM Trunk Group";
export const PCM_TRUNK_GROUP_MODAL_TITLE_EDIT = "Edit PCM Trunk Group";
export const PCM_TRUNK_GROUP_ADD_NEW_LABEL = "+ Add New";
export const PCM_TRUNK_GROUP_DELETE_LABEL = "Delete";
export const PCM_TRUNK_GROUP_SAVE_LABEL = "Save";
export const PCM_TRUNK_GROUP_CLOSE_LABEL = "Close";

/** PCM Trunk Group (PcmTrunkGroupPage) — POST /pstngroups */
export const PCM_TRUNK_GROUP_FIELD_TOOLTIPS = {
  groupId:
    "Saved as group_id. Select 0–255.\n" +
    "On create, the next available group ID may be assigned automatically when adding multiple PSTN spans.\n" +
    "Duplicate group ID is blocked.",
  description:
    "Saved as description. Required non-empty text. Default: Testing.",
  pstnIds:
    "Saved as pstn_ids (span IDs from listPstn).\n" +
    "At least one PCM trunk must be selected. Multiple IDs create separate groups.",
};
