import { useEffect, useRef, useState } from "react";
import { uploadSqlPatch } from "../../../../api/apiService";
import {
  SQL_UPLOAD_LABELS,
  SQL_UPLOAD_MESSAGES,
  SQL_UPLOAD_DEFAULT_TOAST,
  SQL_UPLOAD_TOAST_DURATION_MS,
  SQL_UPLOAD_ERROR_HIDE_MS,
} from "../../../../constants/SqlUploadConstants";
import {
  resolveSqlUploadFile,
  getSqlUploadError,
} from "../utils/SystemToolsSqlUploadTransformers";
import { isSqlUploadFileValid } from "../utils/SystemToolsSqlUploadValidators";

export function useSystemToolsSqlUploadPage() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(SQL_UPLOAD_LABELS.noFile);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(SQL_UPLOAD_DEFAULT_TOAST);
  const fileInputRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(SQL_UPLOAD_DEFAULT_TOAST),
      SQL_UPLOAD_TOAST_DURATION_MS,
    );
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), SQL_UPLOAD_ERROR_HIDE_MS);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = (e) => {
    const next = resolveSqlUploadFile(e.target.files);
    setFile(next.file);
    setError("");
    setFileName(next.fileName);
  };

  const handleUpload = async () => {
    const err = getSqlUploadError(file);
    if (!isSqlUploadFileValid(err)) {
      setError(err);
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      const res = await uploadSqlPatch(file);
      if (res?.success) {
        showToast(res.message || SQL_UPLOAD_MESSAGES.restoreSuccess);
        setFile(null);
        setFileName(SQL_UPLOAD_LABELS.noFile);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setError(res?.message || SQL_UPLOAD_MESSAGES.uploadFailed);
      }
    } catch (e) {
      setError(e?.message || SQL_UPLOAD_MESSAGES.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    isUploading,
    fileName,
    error,
    setError,
    toast,
    setToast,
    fileInputRef,
    handleFileChange,
    handleUpload,
  };
}
