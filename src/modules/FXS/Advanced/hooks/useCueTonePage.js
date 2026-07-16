import { useRef, useState } from "react";
import { CUE_TONE_INITIAL_FORM } from "../../../../constants/CueToneConstants";
import { transformFileChange } from "../utils/CueToneTransformers";
import { validateCueToneUpload } from "../utils/CueToneValidators";

export function useCueTonePage() {
  const [formData, setFormData] = useState(CUE_TONE_INITIAL_FORM);
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const { fileName: nextFileName, file: nextFile } = transformFileChange(file);
    setFileName(nextFileName);
    setFormData((prev) => ({ ...prev, file: nextFile }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = () => {
    const validationError = validateCueToneUpload(formData.file);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    showToast("File uploaded successfully!");
  };

  const clearToast = () => setToast({ msg: "", type: "success" });

  return {
    formData,
    fileName,
    fileInputRef,
    toast,
    clearToast,
    handleFileChange,
    handleInputChange,
    handleUpload,
  };
}
