import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../constants/routeConstants";
import {
  PORT_FXS_MODIFY_FIELDS,
  PORT_FXS_TOTAL_PORTS,
} from "../../../../constants/PortFxsPageConstants";
import { fetchFxsPorts, saveFxsPort } from "../../../../api/apiService";
import {
  buildPortFxsModifySavePayload,
  getInitialPortFxsModifyForm,
  mapPortToModifyForm,
  shouldShowPortFxsModifyField,
} from "../utils/PortFxsModifyTransformers";
import { validatePortFxsModifyForm } from "../utils/PortFxsModifyValidators";

export function usePortFxsModifyPage({
  port: propPort,
  initialPortData,
  onSaved,
  onClose,
  inDialog = false,
  maxPorts: propMaxPorts,
  onSavingChange,
}) {
  const portCount = propMaxPorts || PORT_FXS_TOTAL_PORTS;
  const navigate = useNavigate();
  const location = useLocation();
  const initialPort =
    propPort ||
    (location.state && location.state.port
      ? String(location.state.port)
      : "1");

  const portOptions = Array.from({ length: portCount }, (_, i) =>
    String(i + 1),
  );

  const buildFormState = useCallback(
    (portData) => {
      const base = getInitialPortFxsModifyForm(initialPort);
      return portData ? mapPortToModifyForm(portData, base) : base;
    },
    [initialPort],
  );

  const [form, setForm] = useState(() => buildFormState(initialPortData));
  const [loading, setLoading] = useState(() => !inDialog);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadPortData = useCallback(async () => {
    if (!inDialog) setLoading(true);
    try {
      const res = await fetchFxsPorts();
      const list = Array.isArray(res?.data) ? res.data : [];
      const p = list.find(
        (item) => String(item.port ?? item.id) === String(initialPort),
      );
      if (p) {
        setForm(
          mapPortToModifyForm(
            p,
            getInitialPortFxsModifyForm(String(p.port ?? p.id)),
          ),
        );
      }
    } catch (err) {
      console.warn("Failed to load port data for modify:", err);
    } finally {
      if (!inDialog) setLoading(false);
    }
  }, [initialPort, inDialog]);

  useEffect(() => {
    setForm(buildFormState(initialPortData));
  }, [initialPortData, buildFormState]);

  useEffect(() => {
    if (inDialog && initialPortData) return;
    loadPortData();
  }, [loadPortData, inDialog, initialPortData]);

  useEffect(() => {
    if (inDialog && onSavingChange) onSavingChange(saving);
  }, [saving, inDialog, onSavingChange]);

  const handleChange = (key, value) => {
    const fieldDef = PORT_FXS_MODIFY_FIELDS.find((f) => f.key === key);
    if (fieldDef?.validation === "integer") {
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
      if (key === "dnd" && !prev.dnd) next.callForward = false;
      if (key === "callForward" && !prev.callForward) next.dnd = false;
      return next;
    });
  };

  const shouldShowField = (field) => shouldShowPortFxsModifyField(field, form);

  const handleSave = async (e) => {
    e.preventDefault();
    const validation = validatePortFxsModifyForm(form);
    if (!validation.valid) {
      showMessage("error", validation.message);
      return;
    }

    setSaving(true);
    try {
      const payload = buildPortFxsModifySavePayload(form);
      const res = await saveFxsPort(payload);
      if (!res?.success) throw new Error(res?.message || "Save failed");
      if (typeof onSaved === "function") await onSaved();
      showMessage("success", res?.message || "Port saved successfully!");
      if (typeof onClose === "function") onClose();
      else navigate(ROUTE_PATHS.PORT_FXS);
    } catch (err) {
      console.error("Failed to update port:", err);
      showMessage("error", err?.message || "Failed to update port");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => loadPortData();

  const handleCancel = () => {
    if (typeof onClose === "function") onClose();
    else navigate(ROUTE_PATHS.PORT_FXS);
  };

  return {
    form,
    loading,
    saving,
    message,
    setMessage,
    portOptions,
    inDialog,
    loadPortData,
    handleChange,
    handleCheckbox,
    shouldShowField,
    handleSave,
    handleReset,
    handleCancel,
  };
}
