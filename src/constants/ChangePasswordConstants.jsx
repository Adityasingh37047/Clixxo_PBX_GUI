export const CHANGE_PASSWORD_PAGE_TITLE = "Change Password";

export const CHANGE_PASSWORD_BREADCRUMB = [
  "User Manage",
  "User Permission",
  CHANGE_PASSWORD_PAGE_TITLE,
];

export const CHANGE_PASSWORD_CARD_TITLE = CHANGE_PASSWORD_PAGE_TITLE;

export const CHANGE_PASSWORD_FIELDS = [
  { name: "username", label: "Current Username", type: "text" },
  { name: "newUsername", label: "New Username", type: "text" },
  { name: "password", label: "New Password", type: "password" },
  { name: "confirmPassword", label: "Confirm New Password", type: "password" },
];

export const CHANGE_PASSWORD_INITIAL_FORM = {
  username: "",
  newUsername: "",
  password: "",
  confirmPassword: "",
};

export const CHANGE_PASSWORD_BUTTON_LABELS = {
  SAVE: "Save",
  SAVING: "Changing Password...",
  RESET: "Reset",
};

export const CHANGE_PASSWORD_BUTTON_VARIANTS = {
  PRIMARY: "primary",
  CANCEL: "cancel",
};

export const CHANGE_PASSWORD_BUTTON_STYLE = {
  height: 30,
  minWidth: 100,
  fontSize: 12,
  borderRadius: 10,
  padding: "6px 14px",
  boxSizing: "border-box",
};

export const CHANGE_PASSWORD_TOOLTIPS = {
  username: "The current username of the user.",
  newUsername: "The new username of the user.",
  password: "The password of the user.",
  confirmPassword: "The confirmation password of the user.",
};

export const CHANGE_PASSWORD_MESSAGES = {
  validationFix: "Please fix the validation errors before saving.",
  usernameRequired: "Current username is required",
  newUsernameMinLength: "New username must be at least 5 characters",
  passwordRequired: "Password is required",
  passwordMinLength: "Password must be at least 5 characters",
  passwordMaxLength: "Password must be maximum 16 characters",
  passwordMismatch: "Passwords do not match",
  saveSuccess: "Credentials updated successfully! Redirecting...",
  saveFailed: "Failed to change password",
  saveError: "Error changing password. Please try again.",
};

export const CHANGE_PASSWORD_DEFAULT_TOAST = {
  msg: "",
  type: "success",
};

export const CHANGE_PASSWORD_TOAST_DURATION_MS = 3500;
export const CHANGE_PASSWORD_ERROR_HIDE_MS = 5000;
export const CHANGE_PASSWORD_REDIRECT_DELAY_MS = 1500;

export const CHANGE_PASSWORD_NOTE =
  "Note: After a successful username change you will be logged out automatically.";
