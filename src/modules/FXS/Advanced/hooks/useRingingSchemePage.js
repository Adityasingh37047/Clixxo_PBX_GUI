import { useState } from "react";
import { RINGING_SCHEME_INITIAL_FORM } from "../../../../constants/RingingSchemeConstants";
import {
  applySchemeChange,
  resetRingingSchemeForm,
} from "../utils/RingingSchemeTransformers";
import { validateRingingSchemeForm } from "../utils/RingingSchemeValidators";

export function useRingingSchemePage() {
  const [formData, setFormData] = useState(RINGING_SCHEME_INITIAL_FORM);
  const [changeTime, setChangeTime] = useState(0);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSchemeChange = (value) => {
    setFormData((prev) => applySchemeChange(prev, value, changeTime));
    setChangeTime((prev) => prev + 1);
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 44 || key === 8))
      e.preventDefault();
  };

  const handleKeyPress1 = (e) => {
    const key = e.keyCode || e.which;
    const blocked = [32, 33, 34, 38, 39, 40, 41, 59, 61, 92, 124, 126];
    if (blocked.includes(key) && key !== 8) e.preventDefault();
  };

  const handleSave = () => {
    const validationError = validateRingingSchemeForm(formData);
    if (validationError) {
      alert(validationError.msg);
      document.getElementById(validationError.fieldId)?.focus();
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetRingingSchemeForm(RINGING_SCHEME_INITIAL_FORM));
    setChangeTime(0);
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleSchemeChange,
    handleKeyPress,
    handleKeyPress1,
    handleSave,
    handleReset,
  };
}
