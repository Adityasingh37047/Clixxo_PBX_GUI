import { useState } from "react";
import { CDR_QUERY_INITIAL_FORM } from "../../../../constants/CdrQueryConstants";
import { resetCdrQueryForm } from "../utils/CdrQueryTransformers";
import { validateCdrQueryForm } from "../utils/CdrQueryValidators";

export function useCdrQueryPage() {
  const [formData, setFormData] = useState(CDR_QUERY_INITIAL_FORM);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStringKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (
      key === 32 ||
      key === 46 ||
      key === 95 ||
      key === 8 ||
      (key >= 48 && key <= 57) ||
      (key >= 65 && key <= 90) ||
      (key >= 97 && key <= 122)
    ) {
      return;
    }
    e.preventDefault();
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if ((key > 47 && key < 58) || key === 8) {
      return;
    }
    e.preventDefault();
  };

  const handleQuery = () => {
    const validationError = validateCdrQueryForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }
    alert("Query submitted successfully!");
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    toast,
    clearToast,
    handleInputChange,
    handleStringKeyPress,
    handleNumberKeyPress,
    handleQuery,
    resetForm: () => setFormData(resetCdrQueryForm(CDR_QUERY_INITIAL_FORM)),
  };
}
