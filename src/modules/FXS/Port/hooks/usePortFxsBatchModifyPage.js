import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../constants/routeConstants";
import { PORT_FXS_BATCH_MODIFY_FIELDS } from "../../../../constants/PortFxsPageConstants";
import { saveFxsBatch } from "../../../../api/apiService";
import {
  buildPortFxsBatchSavePayload,
  getInitialPortFxsBatchForm,
  getPortFxsBatchPortOptions,
  shouldShowPortFxsBatchField,
} from "../utils/PortFxsBatchModifyTransformers";
import { validatePortFxsBatchForm } from "../utils/PortFxsBatchModifyValidators";

export function usePortFxsBatchModifyPage({
  initialPorts: propInitialPorts,
  maxPorts,
  onClose,
  onSaved,
  inDialog = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const portOptions = getPortFxsBatchPortOptions(maxPorts);

  const [form, setForm] = useState(() => {
    const initialPorts = propInitialPorts || location.state || null;
    return getInitialPortFxsBatchForm(initialPorts);
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleChange = (key, value) => {
    const fieldDef = PORT_FXS_BATCH_MODIFY_FIELDS.find((f) => f.key === key);
    if (fieldDef && fieldDef.validation === "integer") {
      if (value === "" || /^-?\d+$/.test(value)) {
        setForm((prev) => ({ ...prev, [key]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleCheckbox = (key) => {
    setForm((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === "dnd" && !prev.dnd) {
        next.callForward = false;
      }
      if (key === "callForward" && !prev.callForward) {
        next.dnd = false;
      }
      return next;
    });
  };

  const shouldShowField = (field) => shouldShowPortFxsBatchField(field, form);

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const validation = validatePortFxsBatchForm(form);
    if (!validation.valid) {
      showMessage("error", validation.message);
      return;
    }

    const payload = buildPortFxsBatchSavePayload(form);

    (async () => {
      try {
        const res = await saveFxsBatch(payload);
        if (!res?.success) throw new Error(res?.message || "Batch save failed");
        showMessage(
          "success",
          res?.message || "Batch modify settings saved successfully!",
        );
        if (typeof onSaved === "function") {
          await onSaved();
        } else if (typeof onClose === "function") {
          onClose();
        } else {
          navigate(ROUTE_PATHS.PORT_FXS);
        }
      } catch (err) {
        console.error("Batch modify API failed:", err);
        showMessage(
          "error",
          err?.message || "Failed to save batch modify settings",
        );
      }
    })();
  };

  const handleCancel = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(ROUTE_PATHS.PORT_FXS);
    }
  };

  return {
    form,
    message,
    setMessage,
    portOptions,
    inDialog,
    handleChange,
    handleCheckbox,
    shouldShowField,
    handleSave,
    handleCancel,
  };
}
