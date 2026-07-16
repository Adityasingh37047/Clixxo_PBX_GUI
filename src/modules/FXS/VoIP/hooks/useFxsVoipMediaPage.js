import { useMemo, useState } from "react";
import {
  FXS_VOIP_MEDIA_PARAMETER_ROWS,
  getFxsVoipMediaCodecLabel,
  getFxsVoipMediaInitialCodecs,
  getFxsVoipMediaInitialForm,
  mapFxsVoipMediaCodecOptions,
} from "../utils/FxsVoipMediaTransformers";
import { validateFxsVoipMediaForm } from "../utils/FxsVoipMediaValidators";

export function useFxsVoipMediaPage() {
  const [formData, setFormData] = useState(getFxsVoipMediaInitialForm);
  const [selectedCodecs, setSelectedCodecs] = useState(getFxsVoipMediaInitialCodecs);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const allCodecOptions = useMemo(() => mapFxsVoipMediaCodecOptions(), []);
  const getCodecLabel = getFxsVoipMediaCodecLabel;
  const mediaParameterRows = FXS_VOIP_MEDIA_PARAMETER_ROWS;

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

  const handleSave = () => {
    const validationError = validateFxsVoipMediaForm(formData, selectedCodecs);
    if (validationError) {
      alert(validationError);
      return;
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(getFxsVoipMediaInitialForm());
    setSelectedCodecs(getFxsVoipMediaInitialCodecs());
  };

  return {
    formData,
    selectedCodecs,
    setSelectedCodecs,
    toast,
    setToast,
    allCodecOptions,
    getCodecLabel,
    mediaParameterRows,
    handleInputChange,
    handleSave,
    handleReset,
  };
}
