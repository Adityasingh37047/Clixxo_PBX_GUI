import { useEffect, useState } from "react";
import {
  DEVICE_LOCK_MESSAGES,
  DEVICE_LOCK_DEFAULT_TOAST,
  DEVICE_LOCK_TOAST_DURATION_MS,
  DEVICE_LOCK_ERROR_HIDE_MS,
} from "../../../../constants/DeviceLockConstants";
import {
  toggleDeviceLockOption,
  getDeviceLockValidationError,
} from "../utils/DeviceLockTransformers";
import { isDeviceLockFormValid } from "../utils/DeviceLockValidators";

export function useDeviceLockPage() {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(DEVICE_LOCK_DEFAULT_TOAST);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(DEVICE_LOCK_DEFAULT_TOAST),
      DEVICE_LOCK_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), DEVICE_LOCK_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => toggleDeviceLockOption(prev, option));
  };

  const handleReset = () => {
    setSelectedOptions({});
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleLock = (e) => {
    e.preventDefault();
    const err = getDeviceLockValidationError(password, confirmPassword);
    if (!isDeviceLockFormValid(err)) {
      setError(err);
      return;
    }
    showToast(DEVICE_LOCK_MESSAGES.lockSuccess);
  };

  return {
    selectedOptions,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    toast,
    setToast,
    handleOptionChange,
    handleReset,
    handleLock,
  };
}
