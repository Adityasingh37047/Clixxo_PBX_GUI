import { useRef, useState } from "react";
import {
  SIP_ACCOUNT_TOAST_DEFAULT,
  SIP_ACCOUNT_TOAST_DURATION,
  SIP_ACCOUNT_MESSAGES,
  SIP_ACCOUNT_UPLOAD,
} from "../../../../constants/SIPAccountGeneratorConstants";
import {
  createSipGenInitialForm,
  applySipGenFieldChange,
  resolveSipGenFileSelection,
} from "../utils/SIPAccountGeneratorTransformers";
import { isSipGenUploadFilePresent } from "../utils/SIPAccountGeneratorValidators";

export function useSIPAccountGeneratorPage() {
  const [form, setForm] = useState(createSipGenInitialForm);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(SIP_ACCOUNT_UPLOAD.noFile);
  const fileInputRef = useRef();
  const [toast, setToast] = useState(SIP_ACCOUNT_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(SIP_ACCOUNT_TOAST_DEFAULT);
    }, SIP_ACCOUNT_TOAST_DURATION);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => applySipGenFieldChange(prev, { name, value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    const resolved = resolveSipGenFileSelection(f);
    setFile(resolved.file);
    setFileName(resolved.fileName);
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast(SIP_ACCOUNT_MESSAGES.SAVE_SUCCESS, "success");
    // Save logic here
  };

  const handleUpload = () => {
    if (!isSipGenUploadFilePresent(file)) {
      showToast(SIP_ACCOUNT_MESSAGES.FILE_REQUIRED, "error");
      return;
    }
    showToast(SIP_ACCOUNT_MESSAGES.UPLOAD_SUCCESS, "success");
    // Upload logic here
  };

  const handleDownload = () => {
    showToast(SIP_ACCOUNT_MESSAGES.DOWNLOAD_STARTED, "success");
    // Download logic here
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  return {
    form,
    setForm,
    file,
    setFile,
    fileName,
    setFileName,
    fileInputRef,
    toast,
    setToast,
    showToast,
    handleInputChange,
    handleFileChange,
    handleSave,
    handleUpload,
    handleDownload,
    handleChooseFile,
  };
}
