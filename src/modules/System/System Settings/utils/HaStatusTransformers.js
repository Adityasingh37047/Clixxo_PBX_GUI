import { countRegistered } from "../../../status/PBX Status/utils/PbxMonitorTransformers";
import { HA_CONFIG_STORAGE_KEY } from "../../../../constants/HaConfigConstants";

export const readHaConfigFromStorage = () => {
  try {
    const raw = localStorage.getItem(HA_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const mapApiHaStatus = (apiData = {}, config = {}, monitor = {}) => {
  const extensions = monitor?.extensions ?? [];
  const trunks = monitor?.trunks ?? [];

  return {
    role: apiData.role ?? null,
    maintenance: apiData.maintenance ?? false,
    virtualIp: apiData.virtualIp ?? config.virtualIp ?? "",
    virtualIpInterface:
      apiData.virtualIpInterface ?? config.interface ?? "",
    peerIp: apiData.peerIp ?? config.peerServerIp ?? "",
    peerReachable: apiData.peerReachable,
    keepalived: apiData.keepalived ?? null,
    asterisk: apiData.asterisk ?? null,
    healthCheck: apiData.healthCheck ?? null,
    replication: apiData.replication ?? null,
    replicationLagSec:
      apiData.replicationLagSec ?? apiData.replication_lag_sec ?? null,
    vpnTunnel: apiData.vpnTunnel ?? apiData.vpn_tunnel ?? null,
    trunksRegistered:
      apiData.trunksRegistered ?? countRegistered(trunks),
    phonesContacts:
      apiData.phonesContacts ??
      apiData.phones_contacts ??
      countRegistered(extensions),
    certificate: apiData.certificate ?? null,
    lastRoleChange:
      apiData.lastRoleChange ?? apiData.last_role_change ?? null,
  };
};

export const buildHaStatusFromConfig = (config = {}, monitor = {}) => {
  const mode = (config.mode || "Primary").toLowerCase();
  const role =
    config.haEnabled && mode === "backup"
      ? "STANDBY"
      : config.haEnabled
        ? "ACTIVE"
        : "DISABLED";

  return mapApiHaStatus(
    {
      role,
      maintenance: false,
      peerReachable: null,
      keepalived: null,
      asterisk: null,
      healthCheck: null,
      replication: "n-a",
      replicationLagSec: null,
      vpnTunnel: null,
      certificate: null,
      lastRoleChange: null,
    },
    config,
    monitor,
  );
};
