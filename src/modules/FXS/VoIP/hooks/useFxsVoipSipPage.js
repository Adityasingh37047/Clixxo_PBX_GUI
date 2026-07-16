import { useEffect, useRef, useState } from "react";
import {
  SIP_SETTINGS_FIELDS,
  FXS_VOIP_SIP_LOCAL_REGISTER_STATUS,
  FXS_VOIP_SIP_STATUS_POLL_MS,
} from "../../../../constants/FxsVoipSipConstants";
import {
  listFxsSipSettings,
  saveFxsSipSettings,
  resetFxsSipSettings,
  statusFxsSipSettings,
} from "../../../../api/apiService";
import {
  getFxsVoipSipInitialState,
  getFxsVoipSipLeftColumnFields,
  getFxsVoipSipRightColumnFields,
  mergeFxsVoipSipApiData,
} from "../utils/FxsVoipSipTransformers";
import { isValidFxsVoipSipIntegerInput } from "../utils/FxsVoipSipValidators";

export function useFxsVoipSipPage() {
  const [form, setForm] = useState(getFxsVoipSipInitialState);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [registrationMode, setRegistrationMode] = useState("local");
  const [localModeMsg, setLocalModeMsg] = useState("");
  const statusPollRef = useRef(null);

  const leftColumnFields = getFxsVoipSipLeftColumnFields();
  const rightColumnFields = getFxsVoipSipRightColumnFields();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 6000);
  };

  const applyApiData = (data) => {
    setForm((prev) => mergeFxsVoipSipApiData(prev, data));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const settingsRes = await listFxsSipSettings().catch((e) => {
          console.warn("Failed to load FXS SIP settings:", e);
          return null;
        });
        if (!mounted) return;
        if (settingsRes?.success) {
          const mode = settingsRes.registrationMode || "local";
          setRegistrationMode(mode);
          const localMsg =
            mode === "local"
              ? settingsRes.message || FXS_VOIP_SIP_LOCAL_REGISTER_STATUS
              : "";
          setLocalModeMsg(localMsg);
          applyApiData(settingsRes.data || {});
          if (mode === "local") {
            setForm((prev) => ({
              ...prev,
              registerStatus: FXS_VOIP_SIP_LOCAL_REGISTER_STATUS,
            }));
          }
        }
      } catch (e) {
        console.warn("Error during initial load:", e);
      } finally {
        if (mounted) setLoadingPage(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (statusPollRef.current) clearInterval(statusPollRef.current);
    if (registrationMode === "remote") {
      statusPollRef.current = setInterval(async () => {
        try {
          const res = await statusFxsSipSettings();
          if (res?.success && res.registerStatus) {
            setForm((prev) => ({
              ...prev,
              registerStatus: res.registerStatus,
            }));
          }
        } catch (_) {}
      }, FXS_VOIP_SIP_STATUS_POLL_MS);
    }
    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [registrationMode]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (isValidFxsVoipSipIntegerInput(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveFxsSipSettings(form);
      if (!res?.success) {
        showMessage("error", res?.message || "Failed to save settings.");
        return;
      }
      const mode = res.registrationMode || "local";
      setRegistrationMode(mode);
      const localMsg =
        mode === "local" ? res.message || FXS_VOIP_SIP_LOCAL_REGISTER_STATUS : "";
      setLocalModeMsg(localMsg);
      if (res.data) applyApiData(res.data);
      if (mode === "local") {
        setForm((prev) => ({
          ...prev,
          registerStatus: FXS_VOIP_SIP_LOCAL_REGISTER_STATUS,
        }));
      } else if (res.registerStatus) {
        setForm((prev) => ({ ...prev, registerStatus: res.registerStatus }));
      }
      showMessage("success", res.message || "Settings saved successfully!");
    } catch (err) {
      showMessage("error", err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      const res = await resetFxsSipSettings();
      if (res?.success && res.data) {
        applyApiData(res.data);
        showMessage("info", res.message || "Settings reset to defaults.");
      } else {
        setForm(getFxsVoipSipInitialState());
      }
    } catch (_) {
      setForm(getFxsVoipSipInitialState());
    }
  };

  return {
    form,
    message,
    setMessage,
    loadingPage,
    saving,
    registrationMode,
    localModeMsg,
    leftColumnFields,
    rightColumnFields,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  };
}
