import { useCallback, useEffect, useState } from "react";
import { fetchNetwork } from "../../../../api/apiService";
import {
  HA_CONFIG_INITIAL_FORM,
  HA_CONFIG_MESSAGES,
  HA_CONFIG_STORAGE_KEY,
} from "../../../../constants/HaConfigConstants";
import { isValidIPv4 } from "../../../E1-PRI/SIP/utils/HaValidators";
import {
  buildHaInterfaceOptions,
  HA_INTERFACE_FALLBACK_OPTIONS,
} from "../utils/localIpOptionsUtils";

const normalizeStoredInterface = (value) => {
  if (!value || value === "0.0.0.0") return "";
  return String(value).trim();
};

const readStoredForm = () => {
  try {
    const saved = localStorage.getItem(HA_CONFIG_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return null;
    const merged = { ...HA_CONFIG_INITIAL_FORM, ...parsed };
    // Only keep interface if user explicitly picked it (not old auto-default).
    merged.interface = parsed.interfaceUserSelected
      ? normalizeStoredInterface(merged.interface)
      : "";
    return merged;
  } catch {
    return null;
  }
};

const persistForm = (form, { interfaceUserSelected } = {}) => {
  try {
    const payload = { ...form };
    if (typeof interfaceUserSelected === "boolean") {
      payload.interfaceUserSelected = interfaceUserSelected;
    } else {
      try {
        const saved = localStorage.getItem(HA_CONFIG_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        payload.interfaceUserSelected = Boolean(
          parsed?.interfaceUserSelected,
        );
      } catch {
        payload.interfaceUserSelected = false;
      }
    }
    if (!payload.interface) {
      payload.interfaceUserSelected = false;
    }
    localStorage.setItem(HA_CONFIG_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota errors */
  }
};

export function useHaConfigPage() {
  const [form, setForm] = useState({ ...HA_CONFIG_INITIAL_FORM });
  const [interfaceOptions, setInterfaceOptions] = useState(
    HA_INTERFACE_FALLBACK_OPTIONS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [virtualIpTouched, setVirtualIpTouched] = useState(false);
  const [peerIpTouched, setPeerIpTouched] = useState(false);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  }, []);

  /** Same API as SIP Settings Bind Address — IPs listed in dropdown only. */
  const loadInterfaceOptions = useCallback(async (preferredInterface = "") => {
    const preferred = normalizeStoredInterface(preferredInterface);
    try {
      const netData = await fetchNetwork();
      const allIfaces = netData?.data?.interfaces || [];
      let options = buildHaInterfaceOptions(allIfaces, preferred);
      if (!options.length) {
        options = HA_INTERFACE_FALLBACK_OPTIONS;
      }
      setInterfaceOptions(options);
      return options;
    } catch (error) {
      console.warn("Failed to load network interfaces for HA Interface", error);
      setInterfaceOptions(HA_INTERFACE_FALLBACK_OPTIONS);
      return HA_INTERFACE_FALLBACK_OPTIONS;
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const stored = readStoredForm();
      const nextForm = stored || { ...HA_CONFIG_INITIAL_FORM };
      const options = await loadInterfaceOptions(nextForm.interface);
      const preferred = normalizeStoredInterface(nextForm.interface);
      const preferredOk =
        preferred &&
        options.some((opt) => opt.value === preferred && !opt.disabled);

      const resolvedForm = {
        ...nextForm,
        interface: preferredOk ? preferred : "",
      };
      setForm(resolvedForm);
      persistForm(resolvedForm, {
        interfaceUserSelected: Boolean(preferredOk && preferred),
      });
    } finally {
      setLoading(false);
    }
  }, [loadInterfaceOptions]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggleHaEnabled = () => {
    setForm((prev) => {
      const next = { ...prev, haEnabled: !prev.haEnabled };
      persistForm(next);
      return next;
    });
  };

  const handleChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      persistForm(next, {
        interfaceUserSelected:
          key === "interface" ? Boolean(value) : undefined,
      });
      return next;
    });
  };

  const handleToggleAutoFailback = () => {
    setForm((prev) => {
      const next = { ...prev, autoFailback: !prev.autoFailback };
      persistForm(next);
      return next;
    });
  };

  const handleReset = async () => {
    try {
      localStorage.removeItem(HA_CONFIG_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    await loadInterfaceOptions("");
    const reset = { ...HA_CONFIG_INITIAL_FORM };
    setForm(reset);
    persistForm(reset, { interfaceUserSelected: false });
    setVirtualIpTouched(false);
    setPeerIpTouched(false);
    showMessage("success", HA_CONFIG_MESSAGES.reset);
  };

  const handleSave = () => {
    if (form.haEnabled) {
      if (!isValidIPv4(form.virtualIp)) {
        setVirtualIpTouched(true);
        showMessage("error", HA_CONFIG_MESSAGES.invalidVirtualIp);
        return;
      }
      if (form.peerServerIp && !isValidIPv4(form.peerServerIp)) {
        setPeerIpTouched(true);
        showMessage("error", HA_CONFIG_MESSAGES.invalidPeerIp);
        return;
      }
    }

    setSaving(true);
    try {
      persistForm(form);
      showMessage("success", HA_CONFIG_MESSAGES.saved);
    } finally {
      setSaving(false);
    }
  };

  const virtualIpValid = !form.haEnabled || isValidIPv4(form.virtualIp);
  const peerIpValid =
    !form.haEnabled ||
    !form.peerServerIp ||
    isValidIPv4(form.peerServerIp);

  return {
    form,
    interfaceOptions,
    loading,
    saving,
    message,
    virtualIpTouched,
    peerIpTouched,
    virtualIpValid,
    peerIpValid,
    setMessage,
    setVirtualIpTouched,
    setPeerIpTouched,
    handleToggleHaEnabled,
    handleChange,
    handleToggleAutoFailback,
    handleReset,
    handleSave,
  };
}
