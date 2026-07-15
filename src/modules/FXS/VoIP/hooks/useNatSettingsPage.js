import { useState } from "react";
import { NAT_SETTINGS_FIELDS } from "../../../../constants/NatSettingsConstants";
import {
  getNatSettingsInitialState,
  getNatSettingsLeftColumnFields,
  getNatSettingsRightColumnFields,
} from "../utils/NatSettingsTransformers";
import {
  buildNatSettingsCheckboxUpdate,
  isValidNatSettingsIntegerInput,
} from "../utils/NatSettingsValidators";

export function useNatSettingsPage() {
  const [form, setForm] = useState(getNatSettingsInitialState);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const leftColumnFields = getNatSettingsLeftColumnFields();
  const rightColumnFields = getNatSettingsRightColumnFields();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleChange = (key, value) => {
    const fieldDef = NAT_SETTINGS_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (isValidNatSettingsIntegerInput(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    const updates = buildNatSettingsCheckboxUpdate(form, key);
    if (!updates) return;
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getNatSettingsInitialState());
  };

  return {
    form,
    toast,
    setToast,
    leftColumnFields,
    rightColumnFields,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  };
}
