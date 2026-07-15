import { ACCOUNT_MANAGE_MESSAGES } from "../../../../constants/AccountManageConstants";

export function mapUsersWithAdminFlag(users = []) {
  return users.map((user) => ({
    ...user,
    isAdmin: user.username?.toLowerCase() === "admin",
  }));
}

export function getSelectableIndices(accounts) {
  return accounts
    .map((_, idx) => idx)
    .filter((idx) => !accounts[idx].isAdmin);
}

export function buildSavePayload(formData) {
  return {
    username: formData.userName.trim(),
    password: formData.password,
    authority: formData.authority,
  };
}

export function buildDeleteUsersPayload(selectedIndices, accounts) {
  return selectedIndices
    .map((idx) => accounts[idx])
    .filter((user) => !user.isAdmin)
    .map((user) => ({ id: user.id, username: user.username }));
}

export function buildClearAllPayload(accounts) {
  return accounts
    .filter((user) => !user.isAdmin)
    .map((user) => ({ id: user.id, username: user.username }));
}

export function mapLoadError(error) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ACCOUNT_MANAGE_MESSAGES.loadTimeout;
  }
  if (error.response?.status === 404) {
    return ACCOUNT_MANAGE_MESSAGES.loadNotFound;
  }
  if (error.response?.status >= 500) {
    return ACCOUNT_MANAGE_MESSAGES.loadServerError;
  }
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    return ACCOUNT_MANAGE_MESSAGES.loadNetworkError;
  }
  return error.message || ACCOUNT_MANAGE_MESSAGES.loadFailed;
}

export function mapSaveError(error) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ACCOUNT_MANAGE_MESSAGES.saveTimeout;
  }
  if (error.response?.status === 400) {
    return ACCOUNT_MANAGE_MESSAGES.saveInvalid;
  }
  if (error.response?.status >= 500) {
    return ACCOUNT_MANAGE_MESSAGES.saveServerError;
  }
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    return ACCOUNT_MANAGE_MESSAGES.saveNetworkError;
  }
  return error.message || ACCOUNT_MANAGE_MESSAGES.saveFailed;
}

export function mapUpdateError(error) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ACCOUNT_MANAGE_MESSAGES.updateTimeout;
  }
  if (error.response?.status === 400) {
    return ACCOUNT_MANAGE_MESSAGES.updateInvalid;
  }
  if (error.response?.status >= 500) {
    return ACCOUNT_MANAGE_MESSAGES.updateServerError;
  }
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    return ACCOUNT_MANAGE_MESSAGES.updateNetworkError;
  }
  return error.message || ACCOUNT_MANAGE_MESSAGES.updateFailed;
}

export function mapDeleteError(error) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ACCOUNT_MANAGE_MESSAGES.deleteTimeout;
  }
  if (error.response?.status === 400) {
    return ACCOUNT_MANAGE_MESSAGES.deleteInvalid;
  }
  if (error.response?.status >= 500) {
    return ACCOUNT_MANAGE_MESSAGES.deleteServerError;
  }
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    return ACCOUNT_MANAGE_MESSAGES.deleteNetworkError;
  }
  return error.message || ACCOUNT_MANAGE_MESSAGES.deleteFailed;
}

export function mapClearAllError(error) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ACCOUNT_MANAGE_MESSAGES.clearAllTimeout;
  }
  if (error.response?.status === 400) {
    return ACCOUNT_MANAGE_MESSAGES.clearAllInvalid;
  }
  if (error.response?.status >= 500) {
    return ACCOUNT_MANAGE_MESSAGES.clearAllServerError;
  }
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("Failed to fetch")
  ) {
    return ACCOUNT_MANAGE_MESSAGES.clearAllNetworkError;
  }
  return error.message || ACCOUNT_MANAGE_MESSAGES.clearAllFailed;
}

export function getRowBackground(isSelected, idx) {
  if (isSelected) return "#f0f9ff";
  return idx % 2 === 1 ? "#f8fafc" : "#ffffff";
}
