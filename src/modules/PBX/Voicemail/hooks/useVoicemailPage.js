import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  getVoicemailSettings,
  updateVoicemailSettings,
} from "../../../../api/apiService";
import { VOICEMAIL_INITIAL_FORM } from "../../../../constants/VoicemailConstants";
import { VOICEMAIL_COMPACT_MQ } from "../components/VoicemailTableHelpers";
import {
  buildVoicemailApiPayload,
  mapVoicemailApiToForm,
} from "../utils/VoicemailTransformers";

export function useVoicemailPage() {
  const isCompact = useMediaQuery(VOICEMAIL_COMPACT_MQ);
  const [form, setForm] = useState({ ...VOICEMAIL_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const hasLoaded = useRef(false);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getVoicemailSettings();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(mapVoicemailApiToForm(res.message));
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      loadData();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateVoicemailSettings(buildVoicemailApiPayload(form));
      if (res?.response) {
        showMsg("success", "Voicemail settings saved successfully");
      } else {
        showMsg(
          "error",
          typeof res?.message === "string" ? res.message : "Save failed",
        );
      }
    } catch (e) {
      showMsg("error", e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return {
    isCompact,
    form,
    message,
    setMessage,
    loading,
    saving,
    set,
    handleSave,
  };
}
