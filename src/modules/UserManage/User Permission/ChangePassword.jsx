import React from "react";
import { Alert } from "@mui/material";
import { useChangePasswordPage } from "./hooks/useChangePasswordPage";
import {
  ChangePasswordBreadcrumb,
  ChangePasswordForm,
} from "./components/ChangePasswordFormFields";
import {
  ChangePasswordPageShell,
  changePasswordFixedAlertSx,
} from "./components/ChangePasswordTableHelpers";

const ChangePassword = () => {
  const {
    form,
    loading,
    error,
    setError,
    fieldErrors,
    showPasswords,
    toast,
    clearToast,
    handleChange,
    handleTogglePasswordVisibility,
    handleSave,
  } = useChangePasswordPage();

  return (
    <ChangePasswordPageShell>
      {toast.msg && (
        <Alert severity={toast.type} onClose={clearToast} sx={changePasswordFixedAlertSx}>
          {toast.msg}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            ...changePasswordFixedAlertSx,
            top: toast.msg ? 88 : 20,
          }}
        >
          {error}
        </Alert>
      )}

      <ChangePasswordBreadcrumb />

      <ChangePasswordForm
        form={form}
        loading={loading}
        fieldErrors={fieldErrors}
        showPasswords={showPasswords}
        onChange={handleChange}
        onTogglePasswordVisibility={handleTogglePasswordVisibility}
        onSubmit={handleSave}
      />
    </ChangePasswordPageShell>
  );
};

export default ChangePassword;
