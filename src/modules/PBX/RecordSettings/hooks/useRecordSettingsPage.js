import { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import {
  listIvrDestinations,
  getRecordingSettings,
  updateRecordingSettings,
  resetRecordingSettings,
} from "../../../../api/apiService";
import { EXTENSION_COMPACT_MQ } from "../../../../theme/pbxTokens";
import {
  applyRecordSettingsApiMessage,
  buildInitialForm,
  formToApi,
  mapRecordSettingsDestinationsFromApi,
} from "../utils/RecordSettingsTransformers";
export function useRecordSettingsPage() {
  const isCompact = useMediaQuery(EXTENSION_COMPACT_MQ);
  const [form, setForm] = useState(buildInitialForm);
  const [selectedTrunks, setSelectedTrunks] = useState([]);
  const [selectedExtensions, setSelectedExtensions] = useState([]);
  const [selectedConferences, setSelectedConferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [expandedSections] = useState({
    trunks: true,
    extensions: true,
    conferences: true,
  });
  const [availableTrunks, setAvailableTrunks] = useState([]);
  const [availableExtensions, setAvailableExtensions] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const loadDestinations = async () => {
    try {
      const data = await listIvrDestinations();
      const destinations = mapRecordSettingsDestinationsFromApi(data);
      setAvailableTrunks(destinations.trunks);
      setAvailableExtensions(destinations.extensions);
      setAvailableConferences(destinations.conferences);
    } catch (error) {
      console.error("Failed to load destinations:", error);
      setAvailableTrunks([]);
      setAvailableExtensions([]);
      setAvailableConferences([]);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getRecordingSettings();
      const msg = res?.message ?? res?.data ?? null;
      if (res?.response !== false && msg && typeof msg === "object") {
        const applied = applyRecordSettingsApiMessage(msg);
        setForm(applied.form);
        setSelectedTrunks(applied.selectedTrunks);
        setSelectedExtensions(applied.selectedExtensions);
        setSelectedConferences(applied.selectedConferences);
      }
    } catch (error) {
      showMsg("error", error?.message || "Failed to load recording settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations().finally(loadSettings);
  }, []);

  const dualListConfig = {
    trunks: {
      available: availableTrunks,
      selected: selectedTrunks,
      onChange: setSelectedTrunks,
      expanded: expandedSections.trunks,
    },
    extensions: {
      available: availableExtensions,
      selected: selectedExtensions,
      onChange: setSelectedExtensions,
      expanded: expandedSections.extensions,
    },
    conferences: {
      available: availableConferences,
      selected: selectedConferences,
      onChange: setSelectedConferences,
      expanded: expandedSections.conferences,
    },
  };

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = formToApi(
        form,
        selectedTrunks,
        selectedExtensions,
        selectedConferences,
      );
      const res = await updateRecordingSettings(payload);
      if (res?.response === false) {
        showMsg("error", res?.message || "Failed to save recording settings.");
        return;
      }
      const msg = res?.message ?? res?.data ?? null;
      if (msg && typeof msg === "object") {
        const applied = applyRecordSettingsApiMessage(msg);
        setForm(applied.form);
        setSelectedTrunks(applied.selectedTrunks);
        setSelectedExtensions(applied.selectedExtensions);
        setSelectedConferences(applied.selectedConferences);
      }
      showMsg("success", "Recording settings saved successfully.");
    } catch (error) {
      showMsg("error", error?.message || "Failed to save recording settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await resetRecordingSettings();
      if (res?.response === false) {
        showMsg("error", res?.message || "Failed to reset recording settings.");
        return;
      }
      const msg = res?.message ?? res?.data ?? null;
      if (msg && typeof msg === "object") {
        const applied = applyRecordSettingsApiMessage(msg);
        setForm(applied.form);
        setSelectedTrunks(applied.selectedTrunks);
        setSelectedExtensions(applied.selectedExtensions);
        setSelectedConferences(applied.selectedConferences);
      } else {
        setForm(buildInitialForm());
        setSelectedTrunks([]);
        setSelectedExtensions([]);
        setSelectedConferences([]);
      }
      showMsg("success", "Recording settings reset to defaults.");
    } catch (error) {
      showMsg("error", error?.message || "Failed to reset recording settings.");
    } finally {
      setSaving(false);
    }
  };

  return {
    isCompact,
    form,
    loading,
    saving,
    message,
    setMessage,
    dualListConfig,
    handleChange,
    handleSave,
    handleReset,
  };
}
