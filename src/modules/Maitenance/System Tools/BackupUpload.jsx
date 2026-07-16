import React from "react";
import { Alert } from "@mui/material";
import { BACKUP_UPLOAD_MESSAGE_DEFAULT } from "../../../constants/BackupUploadConstants";
import { useBackupUploadPage } from "./hooks/useBackupUploadPage";
import {
  BackupUploadPageShell,
  BackupUploadBreadcrumb,
  BackupSection,
  RestoreSection,
  backupUploadFixedAlertSx,
} from "./components/BackupUploadFormFields";

const BackupUpload = () => {
  const vm = useBackupUploadPage();
  const {
    fileName,
    fileInputRef,
    loadingBackup,
    loadingRestore,
    message,
    setMessage,
    handleFileChange,
    handleDownloadBackup,
    handleRestoreUpload,
  } = vm;

  return (
    <BackupUploadPageShell>
      <BackupUploadBreadcrumb />

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT)}
          sx={backupUploadFixedAlertSx}
        >
          {message.text}
        </Alert>
      )}

      <BackupSection
        loadingBackup={loadingBackup}
        loadingRestore={loadingRestore}
        onDownload={handleDownloadBackup}
      />

      <RestoreSection
        fileName={fileName}
        fileInputRef={fileInputRef}
        loadingBackup={loadingBackup}
        loadingRestore={loadingRestore}
        onFileChange={handleFileChange}
        onRestore={handleRestoreUpload}
      />
    </BackupUploadPageShell>
  );
};

export default BackupUpload;
