import { OPERATIONS_LOG_MESSAGES } from "../../../../constants/OperationsLogConstants";

export function isOperationsLogUnreadable(parsed) {
  return Boolean(parsed?.unreadable);
}

export function isOperationsLogEmpty(rows) {
  return !Array.isArray(rows) || rows.length === 0;
}

export function getOperationsLogFetchErrorMessage(error) {
  if (error?.response?.data?.message) {
    return String(error.response.data.message);
  }
  return OPERATIONS_LOG_MESSAGES.FETCH_FAILED;
}
