import { useState } from "react";
import {
  IDS_WARNING_LOG,
  IDS_MSG_SAVE_SUCCESS,
  IDS_MSG_RESET_SUCCESS,
  IDS_MSG_DOWNLOAD_STARTED,
  IDS_TOAST_DEFAULT,
  IDS_TOAST_DURATION,
} from "../../../../constants/IDSSettingsConstants";
import {
  createIdsEmptyForm,
  updateIdsThresholdArray,
} from "../utils/IDSSettingsTransformers";
import {
  normalizeIdsThreshold,
  normalizeIdsValidity,
} from "../utils/IDSSettingsValidators";

export function useIDSSettingsPage() {
  const [form, setForm] = useState(createIdsEmptyForm);
  const [log, setLog] = useState(IDS_WARNING_LOG);
  const [toast, setToast] = useState(IDS_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(IDS_TOAST_DEFAULT), IDS_TOAST_DURATION);
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnable = () => {
    setForm((prev) => ({ ...prev, enable: !prev.enable }));
  };

  const handleWarningThreshold = (idx, value) => {
    setForm((prev) => ({
      ...prev,
      warningThresholds: updateIdsThresholdArray(
        prev.warningThresholds,
        idx,
        normalizeIdsThreshold(value),
      ),
    }));
  };

  const handleBlacklistThreshold = (idx, value) => {
    setForm((prev) => ({
      ...prev,
      blacklistThresholds: updateIdsThresholdArray(
        prev.blacklistThresholds,
        idx,
        normalizeIdsThreshold(value),
      ),
    }));
  };

  const handleValidity = (value) => {
    setForm((prev) => ({
      ...prev,
      blacklistValidity: normalizeIdsValidity(value),
    }));
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    showToast(IDS_MSG_SAVE_SUCCESS, "success");
  };

  const handleReset = () => {
    setForm(createIdsEmptyForm());
    showToast(IDS_MSG_RESET_SUCCESS, "info");
  };

  const handleDownload = () => {
    showToast(IDS_MSG_DOWNLOAD_STARTED, "success");
  };

  return {
    form,
    log,
    setLog,
    toast,
    setToast,
    handleCheckbox,
    handleEnable,
    handleWarningThreshold,
    handleBlacklistThreshold,
    handleValidity,
    handleSave,
    handleReset,
    handleDownload,
  };
}
