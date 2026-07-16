import { useState } from "react";
import { ROUTE_SETTINGS_DEFAULTS } from "../../../../constants/RouteRoutingParameterPageConstants";

export function useRouteRoutingParameterPage() {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast("Route settings saved successfully.");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  return {
    settings,
    loading,
    toast,
    setToast,
    handleSave,
    handleChange,
  };
}
