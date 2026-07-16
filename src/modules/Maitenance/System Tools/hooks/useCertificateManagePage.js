import { useState } from "react";
import {
  CERTIFICATE_TOAST_DEFAULT,
  CERTIFICATE_TOAST_DURATION_MS,
  CERTIFICATE_MESSAGES,
} from "../../../../constants/CertificateManageConstants";
import { updateCertificateFormField } from "../utils/CertificateManageTransformers";
import { normalizeCertificateFieldValue } from "../utils/CertificateManageValidators";

export function useCertificateManagePage() {
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(CERTIFICATE_TOAST_DEFAULT);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(
      () => setToast(CERTIFICATE_TOAST_DEFAULT),
      CERTIFICATE_TOAST_DURATION_MS,
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) =>
      updateCertificateFormField(
        prev,
        name,
        normalizeCertificateFieldValue(value),
      ),
    );
  };

  const handleAction = (btnName) => {
    showToast(CERTIFICATE_MESSAGES.ACTION_SUCCESS(btnName), "success");
  };

  return {
    form,
    setForm,
    toast,
    setToast,
    showToast,
    handleChange,
    handleAction,
  };
}
