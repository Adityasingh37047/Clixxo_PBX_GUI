import { useState, useEffect, useRef } from "react";
import {
  UPGRADE_TABLE_HEADERS,
  UPGRADE_LABELS,
  UPGRADE_STATUS,
  UPGRADE_MESSAGES,
  UPGRADE_TIMINGS,
  UPGRADE_FILE,
  UPGRADE_COMMANDS,
  UPGRADE_API,
  UPGRADE_TOOLTIPS,
  UPGRADE_ROUTES,
} from "../../../../constants/UpgradeConstants";
import {
  uploadSoftwareUpdate,
  postLinuxCmd,
} from "../../../../api/apiService";
import axiosInstance from "../../../../api/axiosInstance";
import { passthroughUpgrade } from "../utils/UpgradeTransformers";
import { okUpgrade } from "../utils/UpgradeValidators";

const formatVersionValue = (raw) => {
  if (raw == null || raw === "") return UPGRADE_STATUS.unavailable;
  if (typeof raw === "object") {
    const parts = [raw.version, raw.timestamp, raw.boot, raw.boot_time, raw.value]
      .filter((v) => v != null && String(v).trim() !== "")
      .map((v) => String(v).trim());
    return parts.length ? parts.join(" ") : UPGRADE_STATUS.unavailable;
  }
  return String(raw).trim() || UPGRADE_STATUS.unavailable;
};

const VERSION_FIELDS = [
  {
    key: "serial_no",
    label: UPGRADE_TABLE_HEADERS[0],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.serialNumber,
  },
  {
    key: "web_version",
    label: UPGRADE_TABLE_HEADERS[1],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.webVersion,
  },
  {
    key: "service",
    label: UPGRADE_TABLE_HEADERS[2],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.service,
  },
  {
    key: "uboot",
    label: UPGRADE_TABLE_HEADERS[3],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.uboot,
  },
  {
    key: "kernel",
    label: UPGRADE_TABLE_HEADERS[4],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.kernel,
  },
  {
    key: "firmware",
    label: UPGRADE_TABLE_HEADERS[5],
    formatter: (val) => val || UPGRADE_STATUS.unavailable,
    tooltip: UPGRADE_TOOLTIPS.firmware,
  },
];

const createInitialRows = (placeholder = UPGRADE_STATUS.loading) =>
  VERSION_FIELDS.map((field) => ({
    ...field,
    version: placeholder,
    timestamp: "",
  }));

export function useUpgradePage() {

  const [fileName, setFileName] = useState(UPGRADE_LABELS.noFile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [rebooting, setRebooting] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [versionRows, setVersionRows] = useState(createInitialRows());
  const [versionLoading, setVersionLoading] = useState(false);
  const fileInputRef = useRef();
  const pingIntervalRef = useRef(null);
  const rebootDelayRef = useRef(null);

  const clearPolling = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (rebootDelayRef.current) {
      clearTimeout(rebootDelayRef.current);
      rebootDelayRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  useEffect(() => {
    loadVersionInfo();
  }, []);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), UPGRADE_TIMINGS.alertHideMs);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), UPGRADE_TIMINGS.alertHideMs);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setSelectedFile(f || null);
    setFileName(f ? f.name : UPGRADE_LABELS.noFile);
    setError("");
    setSuccess("");
  };

  const handleReset = () => {
    clearPolling();
    setSelectedFile(null);
    setFileName(UPGRADE_LABELS.noFile);
    setError("");
    setSuccess("");
    setProgressMessage("");
    setUploading(false);
    setRebooting(false);
    loadVersionInfo();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const loadVersionInfo = async () => {
    setVersionLoading(true);
    setVersionRows(createInitialRows(UPGRADE_STATUS.loading));
    try {
      const res = await postLinuxCmd({
        cmd: UPGRADE_COMMANDS.readVersion,
      });
      if (!res?.response || !res?.responseData) {
        throw new Error(res?.message || UPGRADE_MESSAGES.invalidResponse);
      }

      let parsed = {};
      try {
        parsed = JSON.parse(res.responseData);
      } catch {
        throw new Error(UPGRADE_MESSAGES.parseFailed);
      }

      const updatedRows = VERSION_FIELDS.map((field) => {
        const rawValue = parsed[field.key];
        const normalized = formatVersionValue(rawValue);
        const formatted = field.formatter
          ? field.formatter(normalized)
          : normalized;
        return {
          ...field,
          version: String(formatted),
          timestamp: "",
        };
      });
      setVersionRows(updatedRows);
      setError("");
    } catch (err) {
      console.error("Failed to load version info:", err);
      setVersionRows(createInitialRows(UPGRADE_STATUS.unavailable));
      setError(UPGRADE_MESSAGES.loadVersionFailed);
    } finally {
      setVersionLoading(false);
    }
  };

  const checkDeviceOnline = async () => {
    try {
      await axiosInstance.get(UPGRADE_API.servicePing, { timeout: UPGRADE_TIMINGS.pingTimeoutMs });
      return true;
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return true; // backend up but session expired
      }
      return false;
    }
  };

  const beginOnlinePolling = () => {
    clearPolling();
    setProgressMessage(UPGRADE_MESSAGES.rebootingWait);
    let attempts = 0;
    pingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      const online = await checkDeviceOnline();
      if (online) {
        clearPolling();
        setProgressMessage(UPGRADE_MESSAGES.backOnline);
        setTimeout(() => {
          window.location.href = UPGRADE_ROUTES.login;
        }, UPGRADE_TIMINGS.redirectDelayMs);
      } else if (attempts >= UPGRADE_TIMINGS.maxPingAttempts) {
        // ~5 minutes
        clearPolling();
        setRebooting(false);
        setProgressMessage("");
        setError(UPGRADE_MESSAGES.deviceOfflineTimeout);
      }
    }, UPGRADE_TIMINGS.pingIntervalMs);
  };

  const initiateReboot = async () => {
    setRebooting(true);
    setProgressMessage(UPGRADE_MESSAGES.initiatingReboot);
    try {
      await postLinuxCmd({ cmd: UPGRADE_COMMANDS.reboot });
    } catch (err) {
      console.warn(
        "Reboot command failed (continuing to poll):",
        err?.message || err,
      );
    }
    rebootDelayRef.current = setTimeout(() => {
      beginOnlinePolling();
    }, UPGRADE_TIMINGS.rebootDelayMs);
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError(UPGRADE_MESSAGES.selectFileRequired);
      return;
    }
    if (!UPGRADE_FILE.tarRegex.test(selectedFile.name)) {
      setError(UPGRADE_MESSAGES.tarOnly);
      return;
    }

    try {
      setUploading(true);
      setProgressMessage(UPGRADE_MESSAGES.uploading);
      const response = await uploadSoftwareUpdate(selectedFile);
      if (!response?.response) {
        throw new Error(
          response?.message || UPGRADE_MESSAGES.uploadFailed,
        );
      }
      setSuccess(response?.message || UPGRADE_MESSAGES.uploadSuccess);
      setUploading(false);

      // Wait 4-5 seconds before rebooting, show loading during wait
      setRebooting(true);
      setProgressMessage(UPGRADE_MESSAGES.preparingReboot);

      await new Promise((resolve) => setTimeout(resolve, UPGRADE_TIMINGS.preRebootWaitMs));

      await initiateReboot();
    } catch (err) {
      console.error("Update upload failed:", err);
      setUploading(false);
      setProgressMessage("");
      const message =
        typeof err === "string"
          ? err
          : err?.message ||
            err?.error ||
            err?.response?.message ||
            UPGRADE_MESSAGES.uploadFailed;
      setError(message);
    }
  };
  void passthroughUpgrade;
  void okUpgrade;

  return {
    beginOnlinePolling,
    checkDeviceOnline,
    clearPolling,
    error,
    fileInputRef,
    fileName,
    handleFileChange,
    handleReset,
    handleUpdate,
    initiateReboot,
    loadVersionInfo,
    pingIntervalRef,
    progressMessage,
    rebootDelayRef,
    rebooting,
    selectedFile,
    setError,
    setFileName,
    setProgressMessage,
    setRebooting,
    setSelectedFile,
    setSuccess,
    setUploading,
    setVersionLoading,
    setVersionRows,
    success,
    uploading,
    versionLoading,
    versionRows
  };
}
