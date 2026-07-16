import { DEVICE_LOCK_MESSAGES } from "../../../../constants/DeviceLockConstants";

export function toggleDeviceLockOption(prev, option) {
  return { ...prev, [option]: !prev[option] };
}

export function createEmptyDeviceLockState() {
  return {
    selectedOptions: {},
    password: "",
    confirmPassword: "",
  };
}

export function getDeviceLockValidationError(password, confirmPassword) {
  if (!password || !confirmPassword) {
    return DEVICE_LOCK_MESSAGES.passwordRequired;
  }
  if (password !== confirmPassword) {
    return DEVICE_LOCK_MESSAGES.passwordMismatch;
  }
  return "";
}
