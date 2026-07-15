import { HA_DEFAULTS } from "../../../../constants/HaConstants";

export const getHaInitialState = () => ({
  enabled: HA_DEFAULTS.enabled,
  virtualIp: HA_DEFAULTS.virtualIp,
  primaryBackup: HA_DEFAULTS.primaryBackup,
  haEth: HA_DEFAULTS.haEth,
});
