import { useCallback, useEffect, useState } from "react";
import { fetchNetwork } from "../../../../api/apiService";
import {
  SIP_SETTINGS_INITIAL_FORM,
  SIP_SETTINGS_MESSAGES,
} from "../../../../constants/SipSettingsConstants";
import {
  buildLocalIpOptions,
  LOCAL_IP_FALLBACK_OPTIONS,
} from "../utils/localIpOptionsUtils";

export function useSipSettingsPage() {
  const [form, setForm] = useState({ ...SIP_SETTINGS_INITIAL_FORM });
  const [bindAddressOptions, setBindAddressOptions] = useState(
    LOCAL_IP_FALLBACK_OPTIONS,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [certFile, setCertFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  }, []);

  const loadBindAddressOptions = useCallback(async (currentValue = "") => {
    try {
      const netData = await fetchNetwork();
      const allIfaces = netData?.data?.interfaces || [];
      setBindAddressOptions(buildLocalIpOptions(allIfaces, currentValue));
    } catch (error) {
      console.warn("Failed to load network interfaces for Bind Address", error);
      setBindAddressOptions(LOCAL_IP_FALLBACK_OPTIONS);
    }
  }, []);

  useEffect(() => {
    loadBindAddressOptions(SIP_SETTINGS_INITIAL_FORM.bindAddress);
  }, [loadBindAddressOptions]);

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

  const handleReset = () => {
    setForm({ ...SIP_SETTINGS_INITIAL_FORM });
    setCertFile(null);
    setKeyFile(null);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      showMessage("success", SIP_SETTINGS_MESSAGES.saveSuccess);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCertificate = () => {
    if (!certFile) {
      showMessage("error", SIP_SETTINGS_MESSAGES.certRequired);
      return;
    }

    setUploading(true);
    try {
      showMessage("success", SIP_SETTINGS_MESSAGES.uploadSuccess);
      setCertFile(null);
      setKeyFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadCertificate = () => {
    setDownloading(true);
    try {
      showMessage("success", SIP_SETTINGS_MESSAGES.downloadSuccess);
    } finally {
      setDownloading(false);
    }
  };

  return {
    form,
    bindAddressOptions,
    loading: false,
    saving,
    uploading,
    downloading,
    message,
    certFile,
    keyFile,
    setMessage,
    setCertFile,
    setKeyFile,
    handleChange,
    handleToggle,
    handleReset,
    handleSave,
    handleUploadCertificate,
    handleDownloadCertificate,
  };
}
