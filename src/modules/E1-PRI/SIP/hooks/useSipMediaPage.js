import { useEffect, useMemo, useState } from "react";
import {
  SIP_MEDIA_INITIAL_FORM,
  SIP_MEDIA_MSG_SETTINGS_UPDATED,
  SIP_MEDIA_MSG_SAVE_FAILED,
  SIP_MEDIA_MSG_LOAD_FAILED,
  SIP_MEDIA_MSG_NETWORK_SAVE_FAILED,
  SIP_MEDIA_MSG_RESET,
} from "../../../../constants/SipMediaConstants";
import {
  listMediaSettings,
  updateMediaSettings,
} from "../../../../api/apiService";
import {
  getSipMediaApiToUi,
  mergeSipMediaApiSettings,
  buildSipMediaPayload,
  isSipMediaFieldVisible,
} from "../utils/SipMediaTransformers";

export function useSipMediaPage() {
  const [formData, setFormData] = useState(SIP_MEDIA_INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const apiToUi = useMemo(() => getSipMediaApiToUi(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await listMediaSettings();
        const settings = res?.message?.sip_settings?.[0] || {};
        setFormData(mergeSipMediaApiSettings(settings, apiToUi));
      } catch (e) {
        console.error("Failed to fetch media settings:", e);
        showMessage("error", SIP_MEDIA_MSG_LOAD_FAILED);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiToUi]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = buildSipMediaPayload(formData);
      const res = await updateMediaSettings(payload);
      if (res?.response) {
        showMessage("success", res?.message || SIP_MEDIA_MSG_SETTINGS_UPDATED);
      } else {
        showMessage("error", res?.message || SIP_MEDIA_MSG_SAVE_FAILED);
      }
    } catch (e) {
      console.error("Failed to save media settings:", e);
      showMessage("error", e?.message || SIP_MEDIA_MSG_NETWORK_SAVE_FAILED);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(SIP_MEDIA_INITIAL_FORM);
    showMessage("info", SIP_MEDIA_MSG_RESET);
  };

  const isFieldVisible = (field) => isSipMediaFieldVisible(field, formData);

  return {
    formData,
    loading,
    saving,
    message,
    setMessage,
    handleInputChange,
    handleSave,
    handleReset,
    isFieldVisible,
  };
}
