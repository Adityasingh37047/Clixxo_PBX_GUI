import { useState } from "react";
import { SIP_COMPATIBILITY_FIELDS } from "../../../../constants/SipCompatibilityConstants";
import {
  SIP_COMPATIBILITY_LEFT_COLUMN_LAYOUT,
  SIP_COMPATIBILITY_RIGHT_COLUMN_LAYOUT,
  getSipCompatibilityInitialState,
} from "../utils/SipCompatibilityTransformers";
import { isValidSipCompatibilityIntegerInput } from "../utils/SipCompatibilityValidators";

export function useSipCompatibilityPage() {
  const [form, setForm] = useState(getSipCompatibilityInitialState);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleChange = (key, value) => {
    const fieldDef = SIP_COMPATIBILITY_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (isValidSipCompatibilityIntegerInput(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setForm(getSipCompatibilityInitialState());
  };

  return {
    form,
    toast,
    setToast,
    leftLayout: SIP_COMPATIBILITY_LEFT_COLUMN_LAYOUT,
    rightLayout: SIP_COMPATIBILITY_RIGHT_COLUMN_LAYOUT,
    handleChange,
    handleCheckbox,
    handleSave,
    handleReset,
  };
}
