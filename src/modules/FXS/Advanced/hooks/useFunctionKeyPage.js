import { useMemo, useState } from "react";
import { getInitialFormState } from "../../../../constants/FunctionKeyConstants";
import {
  applyEnableChange,
  applyModeChange,
  groupFieldsBySection,
  resetFunctionKeyForm,
} from "../utils/FunctionKeyTransformers";
import { validateFunctionKeyForm } from "../utils/FunctionKeyValidators";

export function useFunctionKeyPage() {
  const [formData, setFormData] = useState(getInitialFormState());
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const groupedFields = useMemo(() => groupFieldsBySection(), []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    showToast(msg, /successfully/i.test(String(msg)) ? "success" : "error");
  };

  const focusField = (field) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(field.functionKeyKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus();
    });
  };

  const handleEnableChange = (field) => {
    setFormData((prev) => applyEnableChange(prev, field));
  };

  const handleModeChange = (field, value) => {
    setFormData((prev) => applyModeChange(prev, field, value));
  };

  const handleFunctionKeyChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field.functionKeyKey]: value }));
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      !(
        key === 8 ||
        key === 127 ||
        (key >= 48 && key <= 57) ||
        key === 42 ||
        key === 35
      )
    ) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    const validationError = validateFunctionKeyForm(formData);
    if (validationError) {
      alert(validationError.message);
      focusField(validationError.field);
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetFunctionKeyForm(getInitialFormState()));
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    groupedFields,
    toast,
    clearToast,
    handleEnableChange,
    handleModeChange,
    handleFunctionKeyChange,
    handleKeyPress,
    handleSave,
    handleReset,
  };
}
