import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  getFeatureCodes,
  updateFeatureCodes,
  listIvrDestinations,
} from "../../../../api/apiService";
import { FEATURE_CODE_INITIAL_FORM } from "../../../../constants/FeatureCodeConstants";
import {
  FEATURE_CODE_COMPACT_MQ,
  FEATURE_CODE_PAIR_STACK_MQ,
} from "../components/FeatureCodeTableHelpers";
import {
  TIMEOUT_DESTINATION_STATIC_OPTIONS,
  featureCodeApiToForm,
  featureCodeFormToApi,
  mapFeatureCodeDestinationsFromApi,
} from "../utils/FeatureCodeTransformers";

export function useFeatureCodePage() {
  const isCompact = useMediaQuery(FEATURE_CODE_COMPACT_MQ);
  const stackFieldPairs =
    isCompact || useMediaQuery(FEATURE_CODE_PAIR_STACK_MQ);
  const [form, setForm] = useState({ ...FEATURE_CODE_INITIAL_FORM });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extensionOptions, setExtensionOptions] = useState([]);
  const hasLoaded = useRef(false);

  const timeoutDestinationOptions = useMemo(
    () => [...TIMEOUT_DESTINATION_STATIC_OPTIONS, ...extensionOptions],
    [extensionOptions],
  );

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const handleChange = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const loadDestinations = async () => {
    try {
      const destRes = await listIvrDestinations();
      setExtensionOptions(mapFeatureCodeDestinationsFromApi(destRes));
    } catch (_) {
      setExtensionOptions([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getFeatureCodes();
      if (res?.response && res?.message && typeof res.message === "object") {
        setForm(featureCodeApiToForm(res.message));
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
      loadDestinations();
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateFeatureCodes(featureCodeFormToApi(form));
      if (res?.response) {
        showMsg("success", "Feature codes saved successfully");
        if (res.message && typeof res.message === "object") {
          setForm(featureCodeApiToForm(res.message));
        }
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
    stackFieldPairs,
    form,
    message,
    setMessage,
    loading,
    saving,
    timeoutDestinationOptions,
    handleChange,
    handleSave,
  };
}
