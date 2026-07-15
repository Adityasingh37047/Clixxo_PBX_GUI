import { useEffect, useState } from "react";
import { PCM_RECEPTION_TIMEOUT_INITIAL_FORM } from "../../../../constants/PcmReceptionTimeoutConstants";
import {
  buildDefaultPcmReceptionTimeoutForm,
  pcmReceptionTimeoutFormFromRow,
} from "../utils/PcmReceptionTimeoutTransformers";

export function usePcmReceptionTimeoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(buildDefaultPcmReceptionTimeoutForm());
  const [timeoutData, setTimeoutData] = useState(
    PCM_RECEPTION_TIMEOUT_INITIAL_FORM,
  );
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleOpenModal = () => {
    setFormData(pcmReceptionTimeoutFormFromRow(timeoutData));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setTimeoutData(formData);
    setIsModalOpen(false);
    showToast("Timeout settings saved successfully", "success");
  };

  return {
    isModalOpen,
    formData,
    timeoutData,
    toast,
    setToast,
    handleOpenModal,
    handleCloseModal,
    handleInputChange,
    handleSave,
  };
}
