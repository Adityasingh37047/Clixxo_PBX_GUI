import { useState } from "react";
import {
  DIALING_TIMEOUT_INITIAL_FORM,
  DIALING_TIMEOUT_INITIAL_DATA,
} from "../../../../constants/DialingTimeoutConstants";
import {
  buildSavedTimeoutData,
  formFromTimeoutData,
  resetDialingTimeoutForm,
} from "../utils/DialingTimeoutTransformers";
import { validateDialingTimeoutForm } from "../utils/DialingTimeoutValidators";

export function useDialingTimeoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(DIALING_TIMEOUT_INITIAL_FORM);
  const [timeoutData, setTimeoutData] = useState(DIALING_TIMEOUT_INITIAL_DATA);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleOpenModal = () => {
    setFormData(formFromTimeoutData(timeoutData));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(resetDialingTimeoutForm(DIALING_TIMEOUT_INITIAL_FORM));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const validationError = validateDialingTimeoutForm(formData);
    if (validationError) {
      alert(validationError);
      return;
    }

    setTimeoutData(buildSavedTimeoutData(timeoutData, formData));
    alert("Dialing timeout settings saved successfully!");
    handleCloseModal();
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8 || key === 127)) {
      e.preventDefault();
    }
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    isModalOpen,
    formData,
    timeoutData,
    toast,
    clearToast,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
    handleKeyPress,
  };
}
