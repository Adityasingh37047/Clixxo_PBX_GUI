import { useEffect, useState } from "react";
import {
  getLicenseLimits,
  updateLicenseLimits,
} from "../../../../api/apiService";
import {
  LICENSE_LIMITS_MESSAGES,
  LICENSE_LIMITS_MESSAGE_DEFAULT,
  LICENSE_LIMITS_MESSAGE_TIMEOUT_MS,
} from "../../../../constants/LicenseLimitsConstants";
import {
  createLicenseLimitsForm,
  mapLicenseLimitsResponse,
  toLicenseLimitsPayload,
} from "../utils/LicenseLimitsTransformers";
import { normalizeLicenseLimitValue } from "../utils/LicenseLimitsValidators";

export function useLicenseLimitsPage() {
  const [form, setForm] = useState(createLicenseLimitsForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(LICENSE_LIMITS_MESSAGE_DEFAULT);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(
        () => setMessage(LICENSE_LIMITS_MESSAGE_DEFAULT),
        LICENSE_LIMITS_MESSAGE_TIMEOUT_MS,
      );
      return () => clearTimeout(t);
    }
  }, [message.text]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLicenseLimits();
        if (res?.response && res?.message) {
          setForm(mapLicenseLimitsResponse(res.message));
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: err?.message || LICENSE_LIMITS_MESSAGES.loadFailed,
        });
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: normalizeLicenseLimitValue(value),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateLicenseLimits(toLicenseLimitsPayload(form));
      if (res?.response) {
        setMessage({
          type: "success",
          text: LICENSE_LIMITS_MESSAGES.saveSuccess,
        });
      } else {
        setMessage({
          type: "error",
          text:
            typeof res?.message === "string"
              ? res.message
              : LICENSE_LIMITS_MESSAGES.saveFailed,
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || LICENSE_LIMITS_MESSAGES.saveFailed,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    message,
    setMessage,
    handleChange,
    handleSave,
  };
}
