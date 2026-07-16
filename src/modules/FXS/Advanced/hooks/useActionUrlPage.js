import { useState } from "react";
import { ACTION_URL_INITIAL_FORM } from "../../../../constants/ActionUrlConstants";
import { resetActionUrlForm } from "../utils/ActionUrlTransformers";
import { validateActionUrlForm } from "../utils/ActionUrlValidators";

export function useActionUrlPage() {
  const [formData, setFormData] = useState(ACTION_URL_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const validationError = validateActionUrlForm();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    showToast("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(resetActionUrlForm(ACTION_URL_INITIAL_FORM));
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleSave,
    handleReset,
  };
}
