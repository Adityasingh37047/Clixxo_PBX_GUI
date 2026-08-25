import { useCallback, useEffect, useState } from "react";
import {
  disableHaConfig,
  fetchNetwork,
  getHaConfig,
  getHaPeerStatus,
  getHaStatus,
  getHaPairingStatus,
  joinHaPairing,
  saveHaConfig,
  startHaPairing,
  cancelHaPairing,
    unpairHa,
  resetHa,
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

export const HA_SCREENS = {
  NOT_CONFIGURED: 1,      // Screen 1: High Availability is not configured
  CONFIG_FORM: 2,         // Screen 2: The config form (Primary setup / edit)
  CONFIGURED_UNPAIRED: 3, // Screen 3: Configured, not paired
  CODE_DISPLAYED: 4,      // Screen 4: Pairing code displayed with countdown & polling
  DASHBOARD: 5,           // Screen 5: The dashboard (ACTIVE/BACKUP status)
};

export function useHaConfigPage() {
  const [form, setForm] = useState({ ...HA_CONFIG_INITIAL_FORM });
  const [interfaceOptions, setInterfaceOptions] = useState(
    HA_INTERFACE_FALLBACK_OPTIONS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [virtualIpTouched, setVirtualIpTouched] = useState(false);
  const [peerIpTouched, setPeerIpTouched] = useState(false);

  // ── 5-Screen HA Navigation & Pairing State ──
  const [currentScreen, setCurrentScreen] = useState(HA_SCREENS.NOT_CONFIGURED);
  const [pairingCodeInfo, setPairingCodeInfo] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [haStatus, setHaStatus] = useState(null);
  const [haPeerStatus, setHaPeerStatus] = useState(null);


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

  // Initial Data Load & Automatic Screen Selection
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [configRes, pairingRes, statusRes] = await Promise.allSettled([
        getHaConfig(),
        getHaPairingStatus(),
        getHaStatus(),
      ]);

      const configData = configRes.status === "fulfilled" ? configRes.value : {};
      const pairingData = pairingRes.status === "fulfilled" ? pairingRes.value : {};
      const statusData = statusRes.status === "fulfilled" ? statusRes.value : null;

      if (statusData) {
        setHaStatus(statusData);
      }

      await applyLoadedForm(configData || {});

      const isEnabled = configData?.config?.enabled || configData?.enabled || false;
      const isPaired = pairingData?.paired || false;

      if (!isEnabled) {
        setCurrentScreen(HA_SCREENS.NOT_CONFIGURED);
      } else if (isEnabled && !isPaired) {
        setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
      } else if (isEnabled && isPaired) {
        setCurrentScreen(HA_SCREENS.DASHBOARD);
      }

      return true;
    } catch (error) {
      showMessage(
        "error",
        getHaConfigErrorMessage(error, HA_CONFIG_MESSAGES.loadFailed),
      );
      setForm({ ...HA_CONFIG_INITIAL_FORM });
      await loadInterfaceOptions("");
      setCurrentScreen(HA_SCREENS.NOT_CONFIGURED);
      return false;
    } finally {
      setLoading(false);
    }
  }, [applyLoadedForm, loadInterfaceOptions, showMessage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle Screen 1 Join Action (Backup setup)
  const handleJoin = async (peerIp, code) => {
    setJoining(true);
    try {
      const res = await joinHaPairing(peerIp, code);
      if (res.ok && res.paired && res.configured) {
        showMessage("success", res.message || "Joined peer server successfully.");
        if (res.config) {
          setForm((prev) => ({
            ...prev,
            haEnabled: true,
            virtualIp: res.config.vip || prev.virtualIp,
            peerServerIp: res.config.peer || peerIp,
            interface: res.config.iface || prev.interface,
            mode: "backup",
            autoFailback: !!res.config.autoFailback,
          }));
        }
        setCurrentScreen(HA_SCREENS.DASHBOARD);
      } else if (res.paired && !res.configured) {
        showMessage("warning", res.message || "SSH trust established, but peer has no HA config yet.");
        setCurrentScreen(HA_SCREENS.NOT_CONFIGURED);
      } else {
        showMessage("error", res.message || "Failed to join HA pair.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to join HA pair.";
      showMessage("error", errorMsg);
    } finally {
      setJoining(false);
    }
  };

  // Handle Generate Pairing Code (Screen 3 -> Screen 4)
  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const res = await startHaPairing();
      if (res.ok) {
        setPairingCodeInfo(res);
        setCountdown(res.ttl || 300);
        setCurrentScreen(HA_SCREENS.CODE_DISPLAYED);
      } else {
        showMessage("error", res.message || "Could not generate pairing code.");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || err.message || "Failed to start pairing.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel Pairing Code (Screen 4 -> Screen 3)
  const handleCancelPairing = async () => {
    try {
      await cancelHaPairing();
    } catch (err) {
      console.warn("Error cancelling pairing code:", err);
    } finally {
      setPairingCodeInfo(null);
      setCountdown(0);
      setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
    }
  };

  // Screen 4 Timer Countdown & Polling Effect (Visibility Aware)
  useEffect(() => {
    if (currentScreen !== HA_SCREENS.CODE_DISPLAYED) return undefined;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const pollInterval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await getHaPairingStatus();
        if (res.paired) {
          clearInterval(pollInterval);
          clearInterval(timer);
          showMessage("success", "Peer joined successfully!");
          setCurrentScreen(HA_SCREENS.DASHBOARD);
        } else if (!res.window_open && !res.paired) {
          clearInterval(pollInterval);
          clearInterval(timer);
          showMessage("error", "The pairing code expired. Generate a new one.");
          setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
        }
      } catch (e) {
        console.error("Pairing polling error:", e);
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [currentScreen, showMessage]);

  // Dashboard Polling (Status & Peer Status)
  useEffect(() => {
    if (currentScreen !== HA_SCREENS.DASHBOARD) return undefined;

    const fetchStatusData = async () => {
      if (document.hidden) return;
      try {
        const [statusData, peerData] = await Promise.allSettled([
          getHaStatus(),
          getHaPeerStatus(),
        ]);
        if (statusData.status === "fulfilled") setHaStatus(statusData.value);
        if (peerData.status === "fulfilled") setHaPeerStatus(peerData.value);
      } catch (e) {
        console.error("Dashboard status fetch error:", e);
      }
    };

    fetchStatusData();
    const interval = setInterval(fetchStatusData, 5000);
    return () => clearInterval(interval);
  }, [currentScreen]);

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
        return false;
      }
      if (!isValidIPv4(form.peerServerIp)) {
        setPeerIpTouched(true);
        showMessage("error", HA_CONFIG_MESSAGES.invalidPeerIp);
        return false;
      }
      if (!normalizeInterface(form.interface)) {
        showMessage("error", HA_CONFIG_MESSAGES.invalidInterface);
        return false;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...buildHaConfigPayload(form),
        mode: form.mode || "primary",
      };

      const res = form.haEnabled
        ? await saveHaConfig(payload)
        : await disableHaConfig();

      if (res?.response === false) {
        throw new Error(res?.message || res?.error || HA_CONFIG_MESSAGES.saveFailed);
      }

      if (!form.haEnabled) {
        showMessage("info", "High Availability disabled — virtual IP released");
        setCurrentScreen(HA_SCREENS.NOT_CONFIGURED);
      } else {
        showMessage("success", res?.message || HA_CONFIG_MESSAGES.saved);
        try {
          const pairingRes = await getHaPairingStatus(true);
          if (pairingRes?.paired) {
            setCurrentScreen(HA_SCREENS.DASHBOARD);
          } else {
            setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
          }
        } catch {
          setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
        }
      }
      return true;
    } catch (error) {
      showMessage(
        "error",
        getHaConfigErrorMessage(error, HA_CONFIG_MESSAGES.saveFailed),
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle Remove HA (Reset API call with 2-step confirmation)
  const handleRemoveHa = async () => {
    // 1st Confirmation
    const firstConfirm = window.confirm(
      "Are you sure you want to remove HA from this server?"
    );
    if (!firstConfirm) return;

    // 2nd Confirmation
    const secondConfirm = window.confirm(
      "Are you ABSOLUTELY sure you want to proceed?"
    );
    if (!secondConfirm) return;

    setLoading(true);
    try {
      const res = await resetHa({ removeTrust: true, stopReplication: true });
      if (res.ok || res.response) {
        showMessage("success", res.message || "High Availability removed from this server.");
        setForm({ ...HA_CONFIG_INITIAL_FORM });
        setCurrentScreen(HA_SCREENS.NOT_CONFIGURED);
      } else {
        showMessage("error", res.message || "Failed to remove HA.");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || err.message || "Failed to remove HA.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Unpair SSH Trust
  const handleUnpairHa = async () => {
    if (!window.confirm("Are you sure you want to remove SSH trust between servers?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await unpairHa();
      if (res.ok || res.response) {
        showMessage("success", res.message || "SSH trust removed on both servers.");
        setCurrentScreen(HA_SCREENS.CONFIGURED_UNPAIRED);
      } else {
        showMessage("error", res.message || "Failed to remove SSH trust.");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || err.message || "Failed to remove SSH trust.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToConfigForm = () => {
    setCurrentScreen(HA_SCREENS.CONFIG_FORM);
  };

  const virtualIpValid = !form.haEnabled || isValidIPv4(form.virtualIp);
  const peerIpValid = !form.haEnabled || isValidIPv4(form.peerServerIp);

  return {
    form,
    interfaceOptions,
    loading,
    saving,
    joining,
    message,
    virtualIpTouched,
    peerIpTouched,
    virtualIpValid,
    peerIpValid,
    currentScreen,
    setCurrentScreen,
    pairingCodeInfo,
    countdown,
    haStatus,
    haPeerStatus,
    setMessage,
    setVirtualIpTouched,
    setPeerIpTouched,
    handleToggleHaEnabled,
    handleChange,
    handleToggleAutoFailback,
    handleReset,
    handleSave,
    handleJoin,
    handleGenerateCode,
    handleCancelPairing,
    navigateToConfigForm,
    HA_SCREENS,
    handleRemoveHa,
    handleUnpairHa,
  };
}
