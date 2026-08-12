import { useCallback, useEffect, useState } from "react";
import {
  downloadSslCert,
  fetchNetwork,
  getHaCertificate,
  getTlsWebrtcSettings,
  postHaCertificate,
  saveTlsWebrtcSettings,
  uploadSslCert,
} from "../../../../api/apiService";
import {
  SIP_SETTINGS_INITIAL_FORM,
  SIP_SETTINGS_MESSAGES,
} from "../../../../constants/SipSettingsConstants";
import {
  buildLocalIpOptions,
  LOCAL_IP_FALLBACK_OPTIONS,
} from "../utils/localIpOptionsUtils";
import {
  buildTlsWebrtcPayload,
  mapTlsWebrtcApiToForm,
  mapCertificateInfoToView,
} from "../utils/SipSettingsTransformers";

const stripHtmlToText = (html) =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 409 || data?.busy) {
    return data?.message || data?.error || fallback;
  }

  if (status === 404 || status === 405) return fallback;

  let message = "";
  if (typeof data === "string" && data.trim()) {
    message = data.includes("<") ? stripHtmlToText(data) : data.trim();
  } else if (data?.message) {
    message = String(data.message).trim();
  } else if (error?.message) {
    message = String(error.message).trim();
  }

  if (!message) return fallback;
  if (/cannot\s+(get|post|put|delete)\s+\/api\//i.test(message)) return fallback;
  if (message.length > 120) return fallback;
  return message;
};

const triggerBlobDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "asterisk-ssl-cert.zip";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export function useSipSettingsPage() {
  const [form, setForm] = useState({ ...SIP_SETTINGS_INITIAL_FORM });
  const [bindAddressOptions, setBindAddressOptions] = useState(
    LOCAL_IP_FALLBACK_OPTIONS,
  );
  const [certInfo, setCertInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  }, []);

  const openUploadModal = useCallback(() => {
    setUploadModalOpen(true);
  }, []);

  const closeUploadModal = useCallback(() => {
    setUploadModalOpen(false);
    setCertFile(null);
    setKeyFile(null);
  }, []);

  const openGenerateModal = useCallback(() => {
    setGenerateModalOpen(true);
  }, []);

  const closeGenerateModal = useCallback(() => {
    if (!generating) setGenerateModalOpen(false);
  }, [generating]);

  const loadCertificate = useCallback(async () => {
    try {
      const res = await getHaCertificate();
      if (res?.response === false) {
        throw new Error(res?.message || res?.error || SIP_SETTINGS_MESSAGES.loadFailed);
      }
      setCertInfo(res || null);
      return res;
    } catch (error) {
      console.warn("Failed to load HA certificate", error);
      setCertInfo(null);
      return null;
    }
  }, []);

  const loadBindAddressOptions = useCallback(async (currentValues = []) => {
    const values = (Array.isArray(currentValues) ? currentValues : [currentValues])
      .filter(Boolean);
    try {
      const netData = await fetchNetwork();
      const allIfaces = netData?.data?.interfaces || [];
      let options = buildLocalIpOptions(allIfaces, values[0] || "");
      for (const value of values.slice(1)) {
        if (!options.some((opt) => opt.value === value)) {
          options = [...options, { value, label: value }];
        }
      }
      setBindAddressOptions(options);
    } catch (error) {
      console.warn("Failed to load network interfaces for Bind Address", error);
      setBindAddressOptions(LOCAL_IP_FALLBACK_OPTIONS);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTlsWebrtcSettings();
      if (res?.response === false) {
        throw new Error(res?.message || SIP_SETTINGS_MESSAGES.loadFailed);
      }
      const data = res?.data || {};
      const mapped = mapTlsWebrtcApiToForm(data);
      setForm(mapped);
      await loadCertificate();
      await loadBindAddressOptions([mapped.tlsBindAddress, mapped.bindAddress]);
      return true;
    } catch (error) {
      showMessage("error", getErrorMessage(error, SIP_SETTINGS_MESSAGES.loadFailed));
      await loadBindAddressOptions([
        SIP_SETTINGS_INITIAL_FORM.tlsBindAddress,
        SIP_SETTINGS_INITIAL_FORM.bindAddress,
      ]);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadBindAddressOptions, loadCertificate, showMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const values = [form.bindAddress, form.tlsBindAddress].filter(Boolean);
    if (!values.length) return;
    setBindAddressOptions((prev) => {
      let next = prev;
      for (const value of values) {
        if (next.some((opt) => opt.value === value)) continue;
        next = [...next, { value, label: value }];
      }
      return next === prev ? prev : next;
    });
  }, [form.bindAddress, form.tlsBindAddress]);

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "verifyClient" && value === "no") {
        next.requireClientCert = "no";
      }
      return next;
    });
  };

  const handleToggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = async () => {
    setCertFile(null);
    setKeyFile(null);
    setUploadModalOpen(false);
    const ok = await loadSettings();
    if (ok) {
      showMessage("success", SIP_SETTINGS_MESSAGES.resetSuccess);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveTlsWebrtcSettings(buildTlsWebrtcPayload(form));
      if (res?.response === false) {
        throw new Error(res?.message || SIP_SETTINGS_MESSAGES.saveFailed);
      }
      if (res?.data) setForm(mapTlsWebrtcApiToForm(res.data));
      showMessage("success", SIP_SETTINGS_MESSAGES.saveSuccess);
    } catch (error) {
      showMessage("error", getErrorMessage(error, SIP_SETTINGS_MESSAGES.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!certFile || !keyFile) {
      showMessage("error", "Both cert and key files are required");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadSslCert(certFile, keyFile);
      if (res?.response === false) {
        throw new Error(res?.message || SIP_SETTINGS_MESSAGES.uploadFailed);
      }
      await loadCertificate();
      setCertFile(null);
      setKeyFile(null);
      setUploadModalOpen(false);
      showMessage("success", SIP_SETTINGS_MESSAGES.uploadSuccess);
    } catch (error) {
      showMessage("error", getErrorMessage(error, SIP_SETTINGS_MESSAGES.uploadFailed));
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    setGenerating(true);
    try {
      const res = await postHaCertificate({});
      if (res?.response === false) {
        throw new Error(res?.message || res?.error || SIP_SETTINGS_MESSAGES.generateFailed);
      }
      if (res?.certificate && typeof res.certificate === "object") {
        setCertInfo(res.certificate);
      } else {
        await loadCertificate();
      }
      setGenerateModalOpen(false);
      showMessage("success", res?.message || SIP_SETTINGS_MESSAGES.generateSuccess);
      if (res?.warning) {
        setTimeout(() => {
          showMessage("error", String(res.warning));
        }, 200);
      }
    } catch (error) {
      showMessage(
        "error",
        getErrorMessage(error, SIP_SETTINGS_MESSAGES.generateFailed),
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloading(true);
    try {
      const { blob, fileName } = await downloadSslCert();
      triggerBlobDownload(blob, fileName);
      showMessage("success", SIP_SETTINGS_MESSAGES.downloadSuccess);
    } catch (error) {
      showMessage("error", getErrorMessage(error, SIP_SETTINGS_MESSAGES.downloadFailed));
    } finally {
      setDownloading(false);
    }
  };

  const certificateView = mapCertificateInfoToView(certInfo);

  return {
    form,
    bindAddressOptions,
    certInfo,
    certificateView,
    loading,
    saving,
    uploading,
    generating,
    downloading,
    uploadModalOpen,
    generateModalOpen,
    message,
    certFile,
    keyFile,
    setMessage,
    setCertFile,
    setKeyFile,
    openUploadModal,
    closeUploadModal,
    openGenerateModal,
    closeGenerateModal,
    handleChange,
    handleToggle,
    handleReset,
    handleSave,
    handleUploadCertificate,
    handleGenerateCertificate,
    handleDownloadCertificate,
  };
}