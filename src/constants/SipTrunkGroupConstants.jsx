export const SIP_TRUNK_GROUP_PAGE_BREADCRUMB_ROOT = "E1-PRI";
export const SIP_TRUNK_GROUP_PAGE_BREADCRUMB_SECTION = "SIP";
export const SIP_TRUNK_GROUP_PAGE_TITLE = "SIP Trunk Group";

export const SIP_TRUNK_GROUP_FIELDS = [
  {
    name: "sip_trunk_id",
    label: "SIP Trunk ID",
    type: "select",
    options: ["bsnl", "airtel", "jio"],
    defaultValue: "",
  },
  { name: "group_id", label: "Group ID", type: "text", defaultValue: "" },
];

export const SIP_TRUNK_GROUP_INITIAL_FORM = SIP_TRUNK_GROUP_FIELDS.reduce(
  (acc, field) => {
    if (field.type === "checkbox") acc[field.name] = [];
    else acc[field.name] = field.defaultValue;
    return acc;
  },
  {},
);

export const SIP_TRUNK_GROUP_TABLE_COLUMNS = [
  { key: "check", label: "Check" },
  { key: "index", label: "Id" },
  { key: "sip_trunk_id", label: "SIP Trunk ID" },
  { key: "group_id", label: "Group ID" },
];

export const SIP_TRUNK_GROUP_FIELD_TOOLTIPS = {
  sip_trunk_id:
    "Saved as sip_trunk_id via addGroup.\n" +
    "Required. Options built from listSipRegistrations and SIP-to-SIP extensions.",
  group_id:
    "Saved as group_id via addGroup. Required.\n" +
    "Duplicate Group ID is blocked on create.",
};

export const SIP_TRUNK_GROUP_BTN_INVERSE = "Inverse";
export const SIP_TRUNK_GROUP_BTN_DELETE = "Delete";
export const SIP_TRUNK_GROUP_BTN_CLEAR_ALL = "Clear All";
export const SIP_TRUNK_GROUP_BTN_ADD_NEW = "+ Add New";
export const SIP_TRUNK_GROUP_BTN_PREV = "← Prev";
export const SIP_TRUNK_GROUP_BTN_NEXT = "Next →";
export const SIP_TRUNK_GROUP_BTN_SAVE = "Save";
export const SIP_TRUNK_GROUP_BTN_SAVING = "Saving...";
export const SIP_TRUNK_GROUP_BTN_CLOSE = "Close";

export const SIP_TRUNK_GROUP_MODAL_ADD_TITLE = "Add SIP Trunk Group";
export const SIP_TRUNK_GROUP_MODAL_EDIT_TITLE = "Edit SIP Trunk Group";
export const SIP_TRUNK_GROUP_LABEL_SIP_TRUNK_ID = "SIP Trunk ID:";
export const SIP_TRUNK_GROUP_LABEL_GROUP_ID = "Group ID:";
export const SIP_TRUNK_GROUP_PLACEHOLDER_SELECT_TRUNK = "Select SIP Trunk ID";
export const SIP_TRUNK_GROUP_PLACEHOLDER_NO_OPTIONS = "No options";
export const SIP_TRUNK_GROUP_PLACEHOLDER_GROUP_ID = "Enter Group ID";

export const SIP_TRUNK_GROUP_EMPTY_MESSAGE = "No SIP trunk groups found.";
export const SIP_TRUNK_GROUP_RECORD_LABEL = "group";
export const SIP_TRUNK_GROUP_SELECTED_SUFFIX = "selected";

export const SIP_TRUNK_GROUP_ERR_REQUIRED_FIELDS =
  "Please fill in all required fields";
export const SIP_TRUNK_GROUP_ERR_GROUP_ID_REQUIRED = "Group ID is required.";
export const SIP_TRUNK_GROUP_ERR_DUPLICATE_GROUP_ID = (id) =>
  `Group ID "${id}" already exists. Please choose a different Group ID.`;
export const SIP_TRUNK_GROUP_ERR_SAVE_FAILED = "Save failed";
export const SIP_TRUNK_GROUP_ERR_NETWORK =
  "Network error. Please check your connection.";
export const SIP_TRUNK_GROUP_ERR_SELECT_TO_DELETE =
  "Please select items to delete";
export const SIP_TRUNK_GROUP_ERR_DELETE_FAILED = "Failed to delete group.";
export const SIP_TRUNK_GROUP_ERR_IN_USE = (groupId, reason) =>
  `SIP Trunk Group "${groupId}" cannot be deleted because it is used by ${reason}. Remove or update that rule first.`;

export const SIP_TRUNK_GROUP_MSG_UPDATED = "Updated successfully";
export const SIP_TRUNK_GROUP_MSG_SAVED = "Saved successfully";
export const SIP_TRUNK_GROUP_MSG_DELETED_ONE =
  "SIP trunk group deleted successfully.";
export const SIP_TRUNK_GROUP_MSG_DELETED_MANY = (count) =>
  `${count} SIP trunk group(s) deleted successfully.`;
export const SIP_TRUNK_GROUP_MSG_DELETED_ALL =
  "All SIP trunk groups deleted successfully.";

export const SIP_TRUNK_GROUP_CONFIRM_DELETE_SELECTED =
  "Are you sure you want to delete the selected groups?";
export const SIP_TRUNK_GROUP_CONFIRM_CLEAR_ALL =
  "Are you sure you want to delete all groups?";
export const SIP_TRUNK_GROUP_CONFIRM_DELETE_ONE = (groupId) =>
  `Are you sure you want to delete group "${groupId}"?`;

export const SIP_TRUNK_GROUP_PAGINATION_SHOWING = (
  recordCount,
  recordLabel,
  page,
) =>
  `Showing ${recordCount} ${recordLabel}${recordCount !== 1 ? "s" : ""} on page ${page}`;
export const SIP_TRUNK_GROUP_PAGINATION_PAGE_OF = (page, totalPages) =>
  `Page ${page} of ${totalPages}`;
