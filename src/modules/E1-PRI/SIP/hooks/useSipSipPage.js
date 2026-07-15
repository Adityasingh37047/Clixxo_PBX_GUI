import { useEffect, useMemo, useState } from "react";
import { SIP_SIP_FIELDS, SIP_SIP_ERR_LOAD_FAILED, SIP_SIP_MSG_SETTINGS_UPDATED, SIP_SIP_ERR_SAVE_FAILED } from "../../../../constants/SipSipConstants";
import { listSipSettings, updateSipSettings } from "../../../../api/apiService";
import {
  getSipSipInitialState,
  getSipSipApiToUiKeyMap,
  mergeSipSipApiSettings,
  buildSipSipSettingsPayload,
  isSipSipFieldVisible,
} from "../utils/SipSipTransformers";
import { isValidSipSipIntegerInput } from "../utils/SipSipValidators";

export function useSipSipPage() {
  const [form, setForm] = useState(getSipSipInitialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const apiToUiKeyMap = useMemo(() => getSipSipApiToUiKeyMap(), []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await listSipSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        setForm(mergeSipSipApiSettings(settings, apiToUiKeyMap));
      } catch (e) {
        console.error("Failed to fetch SIP settings:", e);
        showMessage("error", SIP_SIP_ERR_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [apiToUiKeyMap]);

  const handleChange = (key, value) => {
    const fieldDef = SIP_SIP_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (isValidSipSipIntegerInput(value)) {
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
    try {
      setSaving(true);
      const settingsPayload = buildSipSipSettingsPayload(form);
      const res = await updateSipSettings(settingsPayload);
      showMessage("success", res?.message || SIP_SIP_MSG_SETTINGS_UPDATED);
    } catch (e) {
      console.error("Failed to save SIP settings:", e);
      showMessage("error", e?.message || SIP_SIP_ERR_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(getSipSipInitialState());
  };

  const isFieldVisible = (field) => isSipSipFieldVisible(field, form);

  return {
    form,
    loading,
    saving,
    message,
    setMessage,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
    isFieldVisible,
  };
}
