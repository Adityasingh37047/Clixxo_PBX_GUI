import React from "react";
import { Alert } from "@mui/material";
import { RESTART_DEFAULT_TOAST } from "../../../constants/RestartConstants";
import { useRestartPage } from "./hooks/useRestartPage";
import {
  RestartPageShell,
  RestartBreadcrumb,
  RestartSections,
  RestartLoadingOverlay,
  restartFixedAlertSx,
} from "./components/RestartFormFields";

const Restart = () => {
  const vm = useRestartPage();
  const {
    loading,
    error,
    setError,
    toast,
    setToast,
    loadingType,
    progressMessage,
    handleRestart,
  } = vm;

  const alertSx = { ...restartFixedAlertSx, top: 16, right: 16 };

  return (
    <RestartPageShell>
      <RestartBreadcrumb />

      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(RESTART_DEFAULT_TOAST)}
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

      <RestartSections
        loading={loading}
        loadingType={loadingType}
        onRestart={handleRestart}
      />

      <RestartLoadingOverlay
        loading={loading}
        loadingType={loadingType}
        progressMessage={progressMessage}
      />
    </RestartPageShell>
  );
};

export default Restart;
