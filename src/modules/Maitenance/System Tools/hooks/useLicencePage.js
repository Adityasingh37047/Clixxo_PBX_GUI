import { useState, useEffect, useRef, useCallback } from "react";
import {
  getLicenseInfo,
  checkLicenseValidity,
  getSystemFingerprint,
  uploadLicenseFile,
  fetchSystemSerialNumber,
} from "../../../../api/apiService";
import {
  LICENSE_STATUS,
  LICENSE_DEVICE_TYPE_VALUES,
  LICENSE_PLACEHOLDERS,
  LICENSE_DEFAULT_MESSAGE,
  LICENSE_MESSAGE_TIMEOUT_MS,
  LICENSE_ERROR_MESSAGES,
  LICENSE_SUCCESS_MESSAGES,
  LICENSE_FILE_INPUT,
} from "../../../../constants/LicenceConstants";
import { passthroughLicence } from "../utils/LicenceTransformers";
import { okLicence } from "../utils/LicenceValidators";

const LICENCE_DEVICE_TYPE_STORAGE_KEY = "clixxo_licence_device_type";

export function useLicencePage() {
  const fileInputRef = useRef(null);

  const [licenseData, setLicenseData] = useState({
    Serial_Number: "",
    activateDate: "",
    expireDate: "",
    status: LICENSE_STATUS.UNKNOWN,
  });

  const [systemFingerprint, setSystemFingerprint] = useState("");
  const [systemSerial, setSystemSerial] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState(LICENSE_PLACEHOLDERS.NO_FILE);
  const [loading, setLoading] = useState({
    info: false,
    validity: false,
    fingerprint: false,
    upload: false,
  });
  const [message, setMessage] = useState(LICENSE_DEFAULT_MESSAGE);

  const [deviceTypeMode, setDeviceTypeMode] = useState(() => {
    try {
      const stored = localStorage.getItem(LICENCE_DEVICE_TYPE_STORAGE_KEY);
      if (
        stored &&
        Object.values(LICENSE_DEVICE_TYPE_VALUES).includes(stored)
      ) {
        return stored;
      }
    } catch {
      /* ignore storage errors */
    }
    return LICENSE_DEVICE_TYPE_VALUES.IPPBX;
  });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
  }, []);

  const loadSystemSerial = useCallback(async () => {
    try {
      const sn = await fetchSystemSerialNumber();
      setSystemSerial(sn || "");
    } catch (err) {
      console.warn("Failed to load system serial for licence page:", err);
      setSystemSerial("");
    }
  }, []);

  const fetchLicenseInfo = useCallback(async () => {
    setLoading((prev) => ({ ...prev, info: true }));
    try {
      const [response] = await Promise.all([
        getLicenseInfo(),
        loadSystemSerial(),
      ]);
      if (response.response && response.responseData) {
        try {
          const parsedData = JSON.parse(response.responseData);
          setLicenseData((prev) => ({
            ...prev,
            Serial_Number:
              parsedData.license_key || parsedData.Serial_Number || "",
            activateDate: parsedData.activate_date || "",
            expireDate: parsedData.expire_date || "",
          }));
          showMessage("success", LICENSE_SUCCESS_MESSAGES.INFO_FETCHED);
        } catch (parseError) {
          console.error("Error parsing license data:", parseError);
          showMessage("error", LICENSE_ERROR_MESSAGES.INVALID_DATA_FORMAT);
        }
      }
    } catch (error) {
      console.error("Error fetching license info:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.FETCH_INFO_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, info: false }));
    }
  }, [loadSystemSerial, showMessage]);

  const checkValidity = useCallback(async () => {
    setLoading((prev) => ({ ...prev, validity: true }));
    try {
      const response = await checkLicenseValidity();
      if (response.response && response.responseData) {
        const status = response.responseData;
        setLicenseData((prev) => ({ ...prev, status }));
        showMessage("success", LICENSE_SUCCESS_MESSAGES.VALIDITY_CHECKED);
      }
    } catch (error) {
      console.error("Error checking license validity:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.CHECK_VALIDITY_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, validity: false }));
    }
  }, [showMessage]);

  const fetchSystemFingerprint = useCallback(async () => {
    setLoading((prev) => ({ ...prev, fingerprint: true }));
    try {
      const response = await getSystemFingerprint();
      if (response.response && response.responseData) {
        setSystemFingerprint(response.responseData);
        showMessage("success", LICENSE_SUCCESS_MESSAGES.FINGERPRINT_FETCHED);
      }
    } catch (error) {
      console.error("Error fetching system fingerprint:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.GET_FINGERPRINT_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, fingerprint: false }));
    }
  }, [showMessage]);

  useEffect(() => {
    const loadLicenseData = async () => {
      const [infoResult, validityResult, serialResult] =
        await Promise.allSettled([
          fetchLicenseInfo(),
          checkValidity(),
          loadSystemSerial(),
        ]);

      if (infoResult.status === "rejected") {
        console.warn("License info API call failed:", infoResult.reason);
      }
      if (validityResult.status === "rejected") {
        console.warn(
          "License validity check API call failed:",
          validityResult.reason,
        );
      }
      if (serialResult.status === "rejected") {
        console.warn("System serial load failed:", serialResult.reason);
      }
    };

    loadLicenseData();
  }, [fetchLicenseInfo, checkValidity, loadSystemSerial]);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(
        () => setMessage(LICENSE_DEFAULT_MESSAGE),
        LICENSE_MESSAGE_TIMEOUT_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    setSelectedFile(file || null);
    setFileName(file ? file.name : LICENSE_PLACEHOLDERS.NO_FILE);
    if (file) setMessage(LICENSE_DEFAULT_MESSAGE);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showMessage("error", LICENSE_ERROR_MESSAGES.INVALID_FILE);
      return;
    }

    setLoading((prev) => ({ ...prev, upload: true }));
    try {
      const response = await uploadLicenseFile(selectedFile);
      if (response.response) {
        showMessage("success", LICENSE_SUCCESS_MESSAGES.FILE_UPLOADED);
        setSelectedFile(null);
        setFileName(LICENSE_PLACEHOLDERS.NO_FILE);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => fetchLicenseInfo(), 1000);
        setTimeout(() => checkValidity(), 1200);
      }
    } catch (error) {
      console.error("Error uploading license file:", error);
      showMessage("error", LICENSE_ERROR_MESSAGES.UPLOAD_FAILED);
    } finally {
      setLoading((prev) => ({ ...prev, upload: false }));
    }
  };

  const handleDeviceTypeChange = (event) => {
    const value = event.target.value;
    setDeviceTypeMode(value);
    try {
      localStorage.setItem(LICENCE_DEVICE_TYPE_STORAGE_KEY, value);
    } catch {
      /* ignore storage errors */
    }
  };

  const busy =
    loading.info ||
    loading.validity ||
    loading.fingerprint ||
    loading.upload;
  void passthroughLicence;
  void okLicence;

  return {
    busy,
    checkValidity,
    deviceTypeMode,
    fetchLicenseInfo,
    fetchSystemFingerprint,
    fileInputRef,
    fileName,
    handleDeviceTypeChange,
    handleFileSelect,
    handleFileUpload,
    licenseData,
    loadSystemSerial,
    loading,
    message,
    selectedFile,
    setDeviceTypeMode,
    setFileName,
    setLicenseData,
    setLoading,
    setMessage,
    setSelectedFile,
    setSystemFingerprint,
    setSystemSerial,
    showMessage,
    systemFingerprint,
    systemSerial,
  };
}
