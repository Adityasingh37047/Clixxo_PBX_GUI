import { useState } from "react";
import {
  RADIUS_TOAST_DEFAULT,
  RADIUS_TOAST_DURATION,
  RADIUS_MESSAGES,
} from "../../../../constants/RadiusConstants";
import {
  createRadiusInitialForm,
  applyRadiusFieldChange,
  applyRadiusCallTypeChange,
} from "../utils/RadiusTransformers";

export function useRadiusPage() {
  const [form, setForm] = useState(createRadiusInitialForm);
  const [toast, setToast] = useState(RADIUS_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(RADIUS_TOAST_DEFAULT), RADIUS_TOAST_DURATION);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) =>
      applyRadiusFieldChange(prev, { name, value, type, checked }),
    );
  };

  const handleCallTypeChange = (e) => {
    const { value, checked } = e.target;
    setForm((prev) => applyRadiusCallTypeChange(prev, value, checked));
  };

  const handleReset = () => {
    setForm(createRadiusInitialForm());
    showToast(RADIUS_MESSAGES.resetSuccess, "success");
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast(RADIUS_MESSAGES.saveSuccess, "success");
  };

  return {
    form,
    setForm,
    toast,
    setToast,
    showToast,
    handleChange,
    handleCallTypeChange,
    handleReset,
    handleSave,
  };
}
