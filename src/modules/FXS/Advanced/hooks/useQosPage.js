import { useState } from "react";
import { QOS_INITIAL_FORM } from "../../../../constants/QosConstants";
import { resetQosForm, sanitizeQosDigits } from "../utils/QosTransformers";
import { validateQosForm } from "../utils/QosValidators";

export function useQosPage() {
  const [formData, setFormData] = useState(QOS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleSave = () => {
    const validationError = validateQosForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetQosForm(QOS_INITIAL_FORM));
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleToggleQosEnabled = () => {
    setFormData((prev) => ({ ...prev, qosEnabled: !prev.qosEnabled }));
  };

  const handleMediaPremiumQosChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      mediaPremiumQos: sanitizeQosDigits(value),
    }));
  };

  const handleControlPremiumQosChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      controlPremiumQos: sanitizeQosDigits(value),
    }));
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleSave,
    handleReset,
    handleKeyPressInteger,
    handleToggleQosEnabled,
    handleMediaPremiumQosChange,
    handleControlPremiumQosChange,
  };
}
