export const ACCOUNT_MANAGE_PAGE_TITLE = "Account Manage";

export const ACCOUNT_MANAGE_BREADCRUMB = [
  "User Manage",
  "User Permission",
  ACCOUNT_MANAGE_PAGE_TITLE,
];

export const ACCOUNT_MANAGE_CARD_TITLE = "Account List";

export const ACCOUNT_MANAGE_TABLE_COLUMNS = [
  { key: "choose", label: "Choose" },
  { key: "id", label: "Id" },
  { key: "username", label: "Username" },
  { key: "authority", label: "Authority" },
  { key: "modify", label: "Modify" },
];

export const ACCOUNT_MANAGE_MODAL_FIELDS = [
  { name: "index", label: "Index", type: "text", disabled: true },
  { name: "userName", label: "User Name", type: "text" },
  { name: "password", label: "Password", type: "password" },
  {
    name: "authority",
    label: "Authority",
    type: "select",
    options: [
      { value: "Read", label: "Read" },
      { value: "Read, Write", label: "Read, Write" },
    ],
  },
];

export const ACCOUNT_MANAGE_INITIAL_FORM = {
  index: "",
  userName: "",
  password: "",
  authority: "Read, Write",
};

export const ACCOUNT_MANAGE_BUTTON_LABELS = {
  ADD_NEW: "+ Add New",
  INVERSE: "Inverse",
  CLEAR_ALL: "Clear All",
  DELETE: "Delete",
  SAVE: "Save",
  SAVING: "Saving...",
  CLOSE: "Close",
};

export const ACCOUNT_MANAGE_BUTTON_VARIANTS = {
  PRIMARY: "primary",
  CANCEL: "cancel",
};

/** Footer / modal Save & Close — matches PBX addNewModalFooterBtnStyle */
export const ACCOUNT_MANAGE_BUTTON_STYLE = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

/** Toolbar cancel actions — matches PBX extensionCancelBtnStyle */
export const ACCOUNT_MANAGE_TOOLBAR_CANCEL_BUTTON_STYLE = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
};

/** Toolbar primary (+ Add New) — matches PBX extensionPrimaryBtnStyle */
export const ACCOUNT_MANAGE_TOOLBAR_PRIMARY_BUTTON_STYLE = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
};

export const ACCOUNT_MANAGE_TOOLTIPS = {
  index: "The index of the user.",
  userName: "The username of the user.",
  password: "The password of the user.",
  authority: "The authority of the user.",
};

export const ACCOUNT_MANAGE_MODAL_TITLE = "User Information";

export const ACCOUNT_MANAGE_MESSAGES = {
  loading: "Loading account data...",
  loadingTable: "Loading...",
  noData: "No data",
  loadFailed: "Failed to load users. Please refresh the page and try again.",
  loadTimeout:
    "Request timeout. Please check your connection and try again.",
  loadNotFound: "User data not found. Please contact administrator.",
  loadServerError: "Server error. Please try again later or contact support.",
  loadNetworkError:
    "Network connection failed. Please check your internet connection.",
  saveSuccess: "User saved successfully!",
  saveFailed: "Failed to save user.",
  saveTimeout:
    "Save operation timed out. Please check your connection and try again.",
  saveInvalid: "Invalid user data. Please check your input and try again.",
  saveServerError:
    "Server error during save. Please try again later or contact support.",
  saveNetworkError:
    "Network connection failed during save. Please check your connection.",
  updateSuccess: "User updated successfully!",
  updateFailed: "Failed to update user.",
  updateTimeout:
    "Update operation timed out. Please check your connection and try again.",
  updateInvalid: "Invalid user data. Please check your input and try again.",
  updateServerError:
    "Server error during update. Please try again later or contact support.",
  updateNetworkError:
    "Network connection failed during update. Please check your connection.",
  deleteSuccess: "User(s) deleted successfully!",
  deleteFailed: "Failed to delete user.",
  deleteTimeout:
    "Delete operation timed out. Please check your connection and try again.",
  deleteInvalid:
    "Invalid delete request. Please check your selection and try again.",
  deleteServerError:
    "Server error during delete. Please try again later or contact support.",
  deleteNetworkError:
    "Network connection failed during delete. Please check your connection.",
  deleteConfirm: (count) =>
    `Are you sure you want to delete ${count} selected user(s)?`,
  deleteSelectRequired: "Please select users to delete.",
  adminCannotDelete: "Admin user cannot be deleted.",
  clearAllConfirm:
    "Are you sure you want to delete all users? This action cannot be undone. (Current user will not be deleted)",
  clearAllEmpty: "No users to clear.",
  clearAllSuccess: "All users cleared successfully!",
  clearAllFailed: "Failed to clear all users.",
  clearAllTimeout:
    "Clear operation timed out. Please check your connection and try again.",
  clearAllInvalid: "Invalid clear request. Please try again.",
  clearAllServerError:
    "Server error during clear operation. Please try again later or contact support.",
  clearAllNetworkError:
    "Network connection failed during clear operation. Please check your connection.",
  cannotEditCurrentUser: "Cannot edit current user.",
  cannotModifyAdmin: "Admin user cannot be modified.",
  formRequired: "User name and password are required.",
  selectedCount: (count) => `${count} selected`,
  showingRecords: (count) =>
    `Showing ${count} record${count !== 1 ? "s" : ""}`,
  deleteSkipped: (usernames) =>
    `Deleted successfully. Skipped: ${usernames.join(", ")}`,
};

export const ACCOUNT_MANAGE_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const ACCOUNT_MANAGE_TOAST_DURATION_MS = 3500;
export const ACCOUNT_MANAGE_ERROR_HIDE_MS = 5000;

export const ACCOUNT_MANAGE_ICON_COLORS = {
  EDIT: "#2563eb",
};
