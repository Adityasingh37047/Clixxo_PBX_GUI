import React from "react";
import { Alert } from "@mui/material";
import { DEVICE_LOCK_DEFAULT_TOAST } from "../../../constants/DeviceLockConstants";
import { useDeviceLockPage } from "./hooks/useDeviceLockPage";
import {
  DeviceLockPageShell,
  DeviceLockBreadcrumb,
  DeviceLockCard,
  deviceLockFixedAlertSx,
} from "./components/DeviceLockFormFields";

const DeviceLock = () => {
  const vm = useDeviceLockPage();
  const {
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
  } = vm;

  const alertSx = { ...deviceLockFixedAlertSx, top: 16, right: 16 };

  return (
    <DeviceLockPageShell>
      <DeviceLockBreadcrumb />

      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(DEVICE_LOCK_DEFAULT_TOAST)}
          sx={alertSx}
        >
          {toast.msg}
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={alertSx}>
          {error}
        </Alert>
      )}

      <DeviceLockCard
        selectedOptions={selectedOptions}
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onOptionChange={handleOptionChange}
        onLock={handleLock}
        onReset={handleReset}
      />
    </DeviceLockPageShell>
  );
};

export default DeviceLock;
