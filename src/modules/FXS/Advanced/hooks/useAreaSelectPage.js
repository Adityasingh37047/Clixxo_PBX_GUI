import { useState } from "react";
import { AREA_SELECT_INITIAL_FORM } from "../../../../constants/AreaSelectConstants";
import { resetAreaSelectForm } from "../utils/AreaSelectTransformers";
import { validateAreaSelectForm } from "../utils/AreaSelectValidators";

export function useAreaSelectPage() {
  const [formData, setFormData] = useState(AREA_SELECT_INITIAL_FORM);
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
    const validationError = validateAreaSelectForm();
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    showToast("Settings saved successfully!");
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleSave,
    resetForm: () => setFormData(resetAreaSelectForm(AREA_SELECT_INITIAL_FORM)),
  };
}
