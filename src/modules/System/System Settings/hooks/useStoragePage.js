import { useEffect, useState, useCallback } from "react";
import {
  getStorageUsage,
  getStorageSettings,
  updateStorageSettings,
  resetStorageSettings,
  getSftpSettings,
  updateSftpSettings,
  testSftpSettings,
  runSftpBackupNow,
  resetSftpSettings,
} from "../../../../api/apiService";
import {
  STORAGE_TAB_STATUS_ID,
  STORAGE_TAB_AUTO_CLEANUP_ID,
  STORAGE_TAB_BACKUPS_ID,
} from "../../../../constants/StorageConstants";
import { validateAutoCleanupForm } from "../utils/StorageValidators";
import {
  createAutoCleanupInitialForm,
  createBackupsInitialForm,
  createEmptyStorageStatus,
  mapStorageUsageToStatus,
  mapStorageSettingsToForm,
  buildStorageSettingsPayload,
  mapSftpSettingsToForm,
  buildSftpSettingsPayload,
} from "../utils/StorageTransformers";

export function useStoragePage() {
  const [storageStatus, setStorageStatus] = useState(createEmptyStorageStatus);
  const [activeTab, setActiveTab] = useState(STORAGE_TAB_STATUS_ID);
  const [autoCleanupForm, setAutoCleanupForm] = useState(
    createAutoCleanupInitialForm,
  );
  const [backupsForm, setBackupsForm] = useState(createBackupsInitialForm);
  const [errors, setErrors] = useState({});

  // SFTP States
  const [sftpLoading, setSftpLoading] = useState(false);
  const [sftpSaving, setSftpSaving] = useState(false);
  const [sftpTesting, setSftpTesting] = useState(false);
  const [sftpRunningBackup, setSftpRunningBackup] = useState(false);
  const [sftpResetting, setSftpResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const showToast = useCallback((type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage({ type: "", text: "" }), 6000);
  }, []);

  const loadStorageUsage = async () => {
    try {
      const res = await getStorageUsage();
      const data = res.message;
      setStorageStatus(mapStorageUsageToStatus(data));
    } catch (err) {
      console.error("Storage Usage Error:", err);
    }
  };

  const loadStorageSettings = async () => {
    try {
      const res = await getStorageSettings();
      const data = res.message;
      setAutoCleanupForm(mapStorageSettingsToForm(data));
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const loadSftpSettings = async () => {
    setSftpLoading(true);
    try {
      const res = await getSftpSettings();
      if (res && res.message && typeof res.message === "object") {
        setBackupsForm(mapSftpSettingsToForm(res.message));
      }
    } catch (err) {
      console.error("Load SFTP Settings Error:", err);
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to load SFTP settings",
      );
    } finally {
      setSftpLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (activeTab === STORAGE_TAB_STATUS_ID) {
      await loadStorageUsage();
    } else if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
      await loadStorageSettings();
    } else if (activeTab === STORAGE_TAB_BACKUPS_ID) {
      await loadSftpSettings();
    }
  };

  useEffect(() => {
    if (activeTab === STORAGE_TAB_STATUS_ID) {
      loadStorageUsage();
    } else if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
      loadStorageSettings();
    } else if (activeTab === STORAGE_TAB_BACKUPS_ID) {
      loadSftpSettings();
    }
  }, [activeTab]);

  const handleSaveStorageSettings = async () => {
    const validation = validateAutoCleanupForm(autoCleanupForm);

    if (!validation.valid) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});

    try {
      const payload = buildStorageSettingsPayload(autoCleanupForm);
      const res = await updateStorageSettings(payload);
      setErrors({});
      showToast("success", res?.message?.message || "Storage settings saved successfully");
      loadStorageSettings();
      return true;
    } catch (err) {
      console.error("Save Error:", err);
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to save storage settings",
      );
      return false;
    }
  };

  const handleResetStorageSettings = async () => {
    try {
      const res = await resetStorageSettings();
      showToast("success", "Storage settings reset to defaults.");
      await loadStorageSettings();
    } catch (err) {
      console.error("Reset Error:", err);
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to reset storage settings",
      );
    }
  };

  const handleSaveSftpSettings = async () => {
    setSftpSaving(true);
    try {
      const payload = buildSftpSettingsPayload(backupsForm);
      const res = await updateSftpSettings(payload);
      if (res?.response === false) {
        showToast("error", res?.message || "Failed to save SFTP settings");
        return false;
      }
      showToast("success", "SFTP settings saved successfully");
      if (res?.message && typeof res.message === "object") {
        setBackupsForm(mapSftpSettingsToForm(res.message));
      } else {
        await loadSftpSettings();
      }
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Failed to save SFTP settings";
      showToast("error", msg);
      return false;
    } finally {
      setSftpSaving(false);
    }
  };

  const handleTestSftp = async () => {
    setSftpTesting(true);
    try {
      const payload = {
        sftp_address: backupsForm.ftpAddress?.trim() || "",
        username: backupsForm.username?.trim() || "",
        password: backupsForm.password || "",
      };
      const res = await testSftpSettings(payload);
      if (res?.response === true) {
        showToast(
          "success",
          res.message || "Connected to SFTP server successfully!",
        );
      } else {
        const errMsg = res?.message || "SFTP test connection failed.";
        const detail = res?.detail ? ` (${res.detail})` : "";
        showToast("error", `${errMsg}${detail}`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "SFTP test error.";
      const detail = err.response?.data?.detail
        ? ` (${err.response.data.detail})`
        : "";
      showToast("error", `${msg}${detail}`);
    } finally {
      setSftpTesting(false);
    }
  };

  const handleBackupNow = async () => {
    setSftpRunningBackup(true);
    try {
      const res = await runSftpBackupNow();
      if (res?.response === true) {
        showToast("success", res.message || "Backup completed successfully!");
        await loadSftpSettings();
      } else {
        showToast("error", res?.message || "Backup failed.");
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to run backup.",
      );
    } finally {
      setSftpRunningBackup(false);
    }
  };

  const handleResetSftpSettings = async () => {
    if (!window.confirm("Are you sure you want to reset SFTP settings to defaults?")) {
      return;
    }
    setSftpResetting(true);
    try {
      const res = await resetSftpSettings();
      showToast("success", "SFTP settings reset to defaults.");
      if (res?.message && typeof res.message === "object") {
        setBackupsForm(mapSftpSettingsToForm(res.message));
      } else {
        await loadSftpSettings();
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || err.message || "Failed to reset SFTP settings.",
      );
    } finally {
      setSftpResetting(false);
    }
  };

  const handleSaveActiveTab = async () => {
    if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
      return handleSaveStorageSettings();
    }
    if (activeTab === STORAGE_TAB_BACKUPS_ID) {
      return handleSaveSftpSettings();
    }
    return false;
  };

  const handleAutoCleanupChange = (name, value) =>
    setAutoCleanupForm((prev) => ({ ...prev, [name]: value }));

  const handleBackupsChange = (name, value) =>
    setBackupsForm((prev) => ({ ...prev, [name]: value }));

  return {
    storageStatus,
    activeTab,
    setActiveTab,
    autoCleanupForm,
    backupsForm,
    errors,
    sftpLoading,
    sftpSaving,
    sftpTesting,
    sftpRunningBackup,
    sftpResetting,
    toastMessage,
    setToastMessage,
    handleRefresh,
    handleSaveStorageSettings,
    handleResetStorageSettings,
    handleSaveSftpSettings,
    handleTestSftp,
    handleBackupNow,
    handleResetSftpSettings,
    handleSaveActiveTab,
    handleAutoCleanupChange,
    handleBackupsChange,
  };
}
