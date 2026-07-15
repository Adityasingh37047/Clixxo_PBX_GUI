import { useState } from "react";
import { FXS_INITIAL_FORM } from "../../../../constants/FxsConstants";
import { resetFxsForm, shouldShowField } from "../utils/FxsTransformers";
import { validateFxsForm } from "../utils/FxsValidators";

export function useFxsPage() {
  const [formData, setFormData] = useState(FXS_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxToggle = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleKeyPress = (e, type) => {
    const key = e.keyCode || e.which;
    if (type === "number") {
      if (!((key > 47 && key < 58) || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-comma-minus") {
      if (!((key > 47 && key < 58) || key === 44 || key === 45 || key === 8)) {
        e.preventDefault();
      }
    } else if (type === "number-minus") {
      if (!((key > 47 && key < 58) || key === 45 || key === 8)) {
        e.preventDefault();
      }
    }
  };

  const shouldShowFieldForForm = (field) => shouldShowField(field, formData);

  const handleSave = () => {
    const validationError = validateFxsForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetFxsForm(FXS_INITIAL_FORM));
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleCheckboxToggle,
    handleKeyPress,
    shouldShowField: shouldShowFieldForForm,
    handleSave,
    handleReset,
  };
}
