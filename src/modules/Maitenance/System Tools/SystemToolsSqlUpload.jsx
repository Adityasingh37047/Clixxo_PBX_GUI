import React from "react";
import { Alert } from "@mui/material";
import { SQL_UPLOAD_DEFAULT_TOAST } from "../../../constants/SqlUploadConstants";
import { C } from "../../../theme/pbxTokens";
import { useSystemToolsSqlUploadPage } from "./hooks/useSystemToolsSqlUploadPage";
import {
  SystemToolsSqlUploadPageShell,
  SystemToolsSqlUploadBreadcrumb,
  SqlUploadCard,
  sqlUploadFixedAlertSx,
} from "./components/SystemToolsSqlUploadFormFields";

const SystemToolsSqlUpload = () => {
  const vm = useSystemToolsSqlUploadPage();
  const {
    isUploading,
    fileName,
    error,
    setError,
    toast,
    setToast,
    fileInputRef,
    handleFileChange,
    handleUpload,
  } = vm;

  const alertSx = {
    ...sqlUploadFixedAlertSx,
    top: 16,
    right: 16,
    boxShadow: C.cardShadow || 3,
  };

  return (
    <SystemToolsSqlUploadPageShell>
      <SystemToolsSqlUploadBreadcrumb />

      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(SQL_UPLOAD_DEFAULT_TOAST)}
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

      <SqlUploadCard
        fileName={fileName}
        fileInputRef={fileInputRef}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />
    </SystemToolsSqlUploadPageShell>
  );
};

export default SystemToolsSqlUpload;
