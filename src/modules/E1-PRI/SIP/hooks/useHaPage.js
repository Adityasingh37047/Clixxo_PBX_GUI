import { useState } from "react";
import { HA_DEFAULTS } from "../../../../constants/HaConstants";
import { isValidIPv4 } from "../utils/HaValidators";

export function useHaPage() {
  const [enabled, setEnabled] = useState(HA_DEFAULTS.enabled);
  const [virtualIp, setVirtualIp] = useState(HA_DEFAULTS.virtualIp);
  const [primaryBackup, setPrimaryBackup] = useState(HA_DEFAULTS.primaryBackup);
  const [haEth, setHaEth] = useState(HA_DEFAULTS.haEth);
  const [ipTouched, setIpTouched] = useState(false);

  const handleSave = () => {
    // Check if IP is valid before saving
    if (enabled && !isValidIPv4(virtualIp)) {
      // Don't show browser alert, just return - the inline error is already showing
      return;
    }
    alert("Settings saved!");
  };

  const handleReset = () => {
    setEnabled(HA_DEFAULTS.enabled);
    setVirtualIp(HA_DEFAULTS.virtualIp);
    setPrimaryBackup(HA_DEFAULTS.primaryBackup);
    setHaEth(HA_DEFAULTS.haEth);
    setIpTouched(false);
  };

  const ipIsValid = isValidIPv4(virtualIp);

  return {
    enabled,
    setEnabled,
    virtualIp,
    setVirtualIp,
    primaryBackup,
    setPrimaryBackup,
    haEth,
    setHaEth,
    ipTouched,
    setIpTouched,
    ipIsValid,
    handleSave,
    handleReset,
  };
}
