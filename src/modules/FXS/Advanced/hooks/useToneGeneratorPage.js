import { useState } from "react";
import { TONE_GENERATOR_INITIAL_FORM } from "../../../../constants/ToneGeneratorConstants";
import { resetToneGeneratorForm } from "../utils/ToneGeneratorTransformers";
import { validateToneGeneratorForm } from "../utils/ToneGeneratorValidators";

export function useToneGeneratorPage() {
  const [formData, setFormData] = useState(TONE_GENERATOR_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 47 && key <= 57) || key === 43 || key === 44 || key === 8)) {
      e.preventDefault();
    }
  };

  const handleFieldChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    const validationError = validateToneGeneratorForm(formData);
    if (validationError) {
      alert(validationError.msg);
      document.getElementById(validationError.fieldId)?.focus();
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetToneGeneratorForm(TONE_GENERATOR_INITIAL_FORM));
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleKeyPress,
    handleFieldChange,
    handleSave,
    handleReset,
  };
}
