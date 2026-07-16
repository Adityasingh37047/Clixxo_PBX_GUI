import { useState } from "react";
import { ROUTE_ROUTING_PARAMETER_INITIAL_FORM } from "../../../../constants/FxsRouteRoutingParameterPageConstants";

export function useRouteRoutingParameterPage() {
  const [formData, setFormData] = useState(ROUTE_ROUTING_PARAMETER_INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    setLoading(true);
    try {
      showToast("Routing parameters saved successfully.");
    } catch {
      showToast(
        "Failed to save routing parameters. Please try again.",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleReset = () => {
    setFormData(ROUTE_ROUTING_PARAMETER_INITIAL_FORM);
  };

  return {
    formData,
    loading,
    toast,
    setToast,
    handleInputChange,
    handleNumberKeyPress,
    handleSave,
    handleReset,
  };
}
