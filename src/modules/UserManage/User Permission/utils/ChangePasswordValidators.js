import { CHANGE_PASSWORD_MESSAGES } from "../../../../constants/ChangePasswordConstants";

export function buildChangePasswordPayload(form) {
  return {
    username: form.username,
    newUsername: form.newUsername || undefined,
    password: form.password,
    confirmPassword: form.confirmPassword,
  };
}

export function validatePasswordField(password) {
  if (!password) return CHANGE_PASSWORD_MESSAGES.passwordRequired;
  if (password.length < 5) return CHANGE_PASSWORD_MESSAGES.passwordMinLength;
  if (password.length > 16) return CHANGE_PASSWORD_MESSAGES.passwordMaxLength;
  return "";
}

export function validateChangePasswordForm(form) {
  const errors = {};

  if (!form.username) {
    errors.username = CHANGE_PASSWORD_MESSAGES.usernameRequired;
  }

  if (form.newUsername && form.newUsername.length < 5) {
    errors.newUsername = CHANGE_PASSWORD_MESSAGES.newUsernameMinLength;
  }

  const passwordError = validatePasswordField(form.password);
  if (passwordError) errors.password = passwordError;

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = CHANGE_PASSWORD_MESSAGES.passwordMismatch;
  }

  return errors;
}
