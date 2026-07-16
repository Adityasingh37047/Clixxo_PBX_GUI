import { useState } from "react";
import {
  DTMF_INITIAL_FORM,
  DTMF_TAB_DETECTOR,
} from "../../../../constants/DtmfConstants";
import { getTabForField, resetDtmfForm } from "../utils/DtmfTransformers";
import { validateDtmfForm } from "../utils/DtmfValidators";

export function useDtmfPage() {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);
  const [activeTab, setActiveTab] = useState(DTMF_TAB_DETECTOR);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const focusField = (fieldName) => {
    setActiveTab(getTabForField(fieldName));
    requestAnimationFrame(() => {
      document.getElementById(fieldName)?.focus();
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
    if (
      !(
        (key >= 48 && key <= 57) ||
        key === 45 ||
        (allowDecimal && key === 46) ||
        key === 8
      )
    ) {
      e.preventDefault();
    }
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    const validationError = validateDtmfForm(formData);
    if (validationError) {
      alert(validationError.message);
      focusField(validationError.fieldName);
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetDtmfForm(DTMF_INITIAL_FORM));
    setActiveTab(DTMF_TAB_DETECTOR);
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    activeTab,
    setActiveTab,
    toast,
    clearToast,
    handleInputChange,
    handleCheckboxChange,
    handleKeyPress,
    handleKeyPressInteger,
    handleSave,
    handleReset,
  };
}
