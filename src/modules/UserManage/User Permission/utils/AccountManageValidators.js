import { ACCOUNT_MANAGE_MESSAGES } from "../../../../constants/AccountManageConstants";

export function validateAccountForm(formData) {
  if (!formData.userName.trim() || !formData.password.trim()) {
    return ACCOUNT_MANAGE_MESSAGES.formRequired;
  }
  return "";
}
