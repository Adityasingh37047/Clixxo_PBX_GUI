import { USER_MANAGE_MESSAGES } from "../../../../constants/UserManageConstants";

export function validateAddUserForm({ username, password }) {
  if (username.trim().length < 5) {
    return USER_MANAGE_MESSAGES.usernameMinLength;
  }
  if (password.length < 5) {
    return USER_MANAGE_MESSAGES.passwordMinLength;
  }
  return "";
}

export function validateResetPassword(password) {
  if (password.length < 5) {
    return USER_MANAGE_MESSAGES.passwordMinLength;
  }
  return "";
}
