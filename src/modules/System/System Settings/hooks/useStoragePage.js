import { useEffect, useState } from "react";
import {
  getStorageUsage,
  getStorageSettings,
  updateStorageSettings,
} from "../../../../api/apiService";
import {
  STORAGE_TAB_STATUS_ID,
  STORAGE_TAB_AUTO_CLEANUP_ID,
} from "../../../../constants/StorageConstants";
import { validateAutoCleanupForm } from "../utils/StorageValidators";
import {
  createAutoCleanupInitialForm,
  createBackupsInitialForm,
  createEmptyStorageStatus,
  mapStorageUsageToStatus,
  mapStorageSettingsToForm,
  buildStorageSettingsPayload,
} from "../utils/StorageTransformers";

export function useStoragePage() {
  const [storageStatus, setStorageStatus] = useState(createEmptyStorageStatus);
  const [activeTab, setActiveTab] = useState(STORAGE_TAB_STATUS_ID);
  const [autoCleanupForm, setAutoCleanupForm] = useState(
    createAutoCleanupInitialForm,
  );
  const [backupsForm, setBackupsForm] = useState(createBackupsInitialForm);
  const [errors, setErrors] = useState({});

  const loadStorageUsage = async () => {
    try {
      const res = await getStorageUsage();

      console.log("FULL RESPONSE:", res);

      const data = res.message;

      setStorageStatus(mapStorageUsageToStatus(data));
    } catch (err) {
      console.error("Storage Usage Error:", err);
    }
  };

  const loadStorageSettings = async () => {
    try {
      const res = await getStorageSettings();

      console.log("Storage Settings:", res);

      const data = res.message;

      setAutoCleanupForm(mapStorageSettingsToForm(data));
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    if (activeTab === STORAGE_TAB_STATUS_ID) {
      await loadStorageUsage();
    } else if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
      await loadStorageSettings();
    }
  };

  useEffect(() => {
    if (activeTab === STORAGE_TAB_STATUS_ID) {
      loadStorageUsage();
    }

    if (activeTab === STORAGE_TAB_AUTO_CLEANUP_ID) {
      loadStorageSettings();
    }
  }, [activeTab]);

  const handleSaveStorageSettings = async () => {
    const validation = validateAutoCleanupForm(autoCleanupForm);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    try {
      const payload = buildStorageSettingsPayload(autoCleanupForm);

      console.log("Save Payload:", payload);

      const res = await updateStorageSettings(payload);

      console.log("Save Response:", res);

      setErrors({});

      loadStorageSettings();
    } catch (err) {
      console.error("Save Error:", err);
    }
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
    handleRefresh,
    handleSaveStorageSettings,
    handleAutoCleanupChange,
    handleBackupsChange,
  };
}
