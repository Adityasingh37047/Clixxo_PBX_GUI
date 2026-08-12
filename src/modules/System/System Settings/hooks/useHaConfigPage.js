import { useCallback, useEffect, useState } from "react";
import {
  disableHaConfig,
  fetchNetwork,
  getHaConfig,
  saveHaConfig,
} from "../../../../api/apiService";
import {
  HA_CONFIG_INITIAL_FORM,
  HA_CONFIG_MESSAGES,
} from "../../../../constants/HaConfigConstants";
import { isValidIPv4 } from "../../../E1-PRI/SIP/utils/HaValidators";
import {
  buildHaConfigPayload,
  getHaConfigErrorMessage,
  mapHaConfigApiToForm,
} from "../utils/HaConfigTransformers";
import {
  buildHaInterfaceOptions,
  HA_INTERFACE_FALLBACK_OPTIONS,
} from "../utils/localIpOptionsUtils";

const normalizeInterface = (value) => {
  if (!value || value === "0.0.0.0") return "";
  return String(value).trim();
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
    setTimeout(() => setMessage({ type: "", text: "" }), 8000);
  }, []);

  const loadInterfaceOptions = useCallback(async (preferredInterface = "") => {
    const preferred = normalizeInterface(preferredInterface);
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

  const applyLoadedForm = useCallback(
    async (apiData) => {
      const nextForm = mapHaConfigApiToForm(apiData);
      const options = await loadInterfaceOptions(nextForm.interface);
      const preferred = normalizeInterface(nextForm.interface);
      const preferredOk =
        preferred &&
        options.some((opt) => opt.value === preferred && !opt.disabled);
      const resolvedForm = {
        ...nextForm,
        interface: preferredOk ? preferred : "",
      };
      setForm(resolvedForm);
      return resolvedForm;
    },
    [loadInterfaceOptions],
  );

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHaConfig();
      if (res?.response === false) {
        throw new Error(res?.message || res?.error || HA_CONFIG_MESSAGES.loadFailed);
      }
      await applyLoadedForm(res || {});
      return true;
    } catch (error) {
      showMessage(
        "error",
        getHaConfigErrorMessage(error, HA_CONFIG_MESSAGES.loadFailed),
      );
      setForm({ ...HA_CONFIG_INITIAL_FORM });
      await loadInterfaceOptions("");
      return false;
    } finally {
      setLoading(false);
    }
  }, [applyLoadedForm, loadInterfaceOptions, showMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggleHaEnabled = () => {
    setForm((prev) => ({ ...prev, haEnabled: !prev.haEnabled }));
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleAutoFailback = () => {
    setForm((prev) => ({ ...prev, autoFailback: !prev.autoFailback }));
  };

  const handleReset = async () => {
    setVirtualIpTouched(false);
    setPeerIpTouched(false);
    const ok = await loadSettings();
    if (ok) {
      showMessage("success", HA_CONFIG_MESSAGES.reset);
    }
  };

  const handleSave = async () => {
    if (form.haEnabled) {
      if (!isValidIPv4(form.virtualIp)) {
        setVirtualIpTouched(true);
        showMessage("error", HA_CONFIG_MESSAGES.invalidVirtualIp);
        return;
      }
      if (!isValidIPv4(form.peerServerIp)) {
        setPeerIpTouched(true);
        showMessage("error", HA_CONFIG_MESSAGES.invalidPeerIp);
        return;
      }
      if (!normalizeInterface(form.interface)) {
        showMessage("error", HA_CONFIG_MESSAGES.invalidInterface);
        return;
      }
    }

    setSaving(true);
    try {
      const res = form.haEnabled
        ? await saveHaConfig(buildHaConfigPayload(form))
        : await disableHaConfig();

      if (res?.response === false) {
        throw new Error(res?.message || res?.error || HA_CONFIG_MESSAGES.saveFailed);
      }

      try {
        const latest = await getHaConfig();
        if (latest?.response !== false) {
          await applyLoadedForm(latest);
        }
      } catch {
        /* keep posted form if reload fails */
      }

      showMessage("success", res?.message || HA_CONFIG_MESSAGES.saved);
      if (res?.warning) {
        setTimeout(() => {
          showMessage("error", String(res.warning));
        }, 200);
      }
    } catch (error) {
      showMessage(
        "error",
        getHaConfigErrorMessage(error, HA_CONFIG_MESSAGES.saveFailed),
      );
    } finally {
      setSaving(false);
    }
  };

  const virtualIpValid = !form.haEnabled || isValidIPv4(form.virtualIp);
  const peerIpValid = !form.haEnabled || isValidIPv4(form.peerServerIp);

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
