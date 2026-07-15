import { useRef, useState } from "react";
import { downloadBackup, restoreBackup } from "../../../../api/apiService";
import {
  BACKUP_UPLOAD_LABELS,
  BACKUP_UPLOAD_MESSAGES,
  BACKUP_UPLOAD_FILE,
  BACKUP_UPLOAD_MESSAGE_DEFAULT,
  BACKUP_UPLOAD_MESSAGE_TIMEOUT_MS,
} from "../../../../constants/BackupUploadConstants";
import { resolveBackupSelectedFile } from "../utils/BackupUploadTransformers";
import { validateBackupRestoreFile } from "../utils/BackupUploadValidators";

export function useBackupUploadPage() {
  const [fileName, setFileName] = useState(BACKUP_UPLOAD_LABELS.NO_FILE);
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [message, setMessage] = useState(BACKUP_UPLOAD_MESSAGE_DEFAULT);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(
      () => setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT),
      BACKUP_UPLOAD_MESSAGE_TIMEOUT_MS,
    );
  };

  const handleFileChange = (e) => {
    const next = resolveBackupSelectedFile(e.target.files);
    setSelectedFile(next.selectedFile);
    setFileName(next.fileName);
  };

  const handleDownloadBackup = async () => {
    try {
      setLoadingBackup(true);
      setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT);
      const { blob, fileName: dlName } = await downloadBackup();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        dlName || BACKUP_UPLOAD_FILE.DEFAULT_FILE_NAME,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showMessage("success", BACKUP_UPLOAD_MESSAGES.BACKUP_DOWNLOAD_SUCCESS);
    } catch (e) {
      showMessage(
        "error",
        e.message || BACKUP_UPLOAD_MESSAGES.BACKUP_DOWNLOAD_FAILED,
      );
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestoreUpload = async () => {
    try {
      setMessage(BACKUP_UPLOAD_MESSAGE_DEFAULT);
      const err = validateBackupRestoreFile(selectedFile);
      if (err) throw new Error(err);
      setLoadingRestore(true);
      const res = await restoreBackup(selectedFile);
      if (res?.response) {
        showMessage("success", BACKUP_UPLOAD_MESSAGES.RESTORE_SUCCESS);
      } else {
        throw new Error(res?.message || BACKUP_UPLOAD_MESSAGES.RESTORE_FAILED);
      }
    } catch (e) {
      showMessage("error", e.message || BACKUP_UPLOAD_MESSAGES.RESTORE_FAILED);
    } finally {
      setLoadingRestore(false);
    }
  };

  return {
    fileName,
    fileInputRef,
    selectedFile,
    loadingBackup,
    loadingRestore,
    message,
    setMessage,
    handleFileChange,
    handleDownloadBackup,
    handleRestoreUpload,
  };
}
