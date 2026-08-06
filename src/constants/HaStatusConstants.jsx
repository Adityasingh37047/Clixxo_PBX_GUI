export const HA_STATUS_TITLE = "HA Status";

export const HA_STATUS_BREADCRUMB_SEGMENTS = [
  "Status",
  "PBX Status",
  "HA Status",
];

export const HA_STATUS_CARD_TITLE = "HA Status";

export const HA_STATUS_BTN_REFRESH = "Refresh";
export const HA_STATUS_BTN_CONFIGURE = "Configure HA";

export const HA_STATUS_REFRESH_INTERVAL_MS = 30000;

export const HA_STATUS_NOT_ENABLED_HEADING = "HA is not enabled";

export const HA_STATUS_NOT_ENABLED_LINES = [
  "This server is running standalone. If it fails, calls stop until it is restored.",
  "With HA, a second server takes over automatically within seconds.",
  "Requires: a second Clixxo server on the same network, and one spare IP address.",
];

export const HA_STATUS_ROW_LABELS = {
  role: "Role",
  maintenance: "Maintenance",
  virtualIp: "Virtual IP",
  peer: "Peer",
  keepalived: "Keepalived",
  asterisk: "Asterisk",
  healthCheck: "Health check",
  replication: "Replication",
  replicationLag: "Replication lag",
  vpnTunnel: "VPN tunnel",
  trunks: "Trunks",
  phones: "Phones",
  certificate: "Certificate",
  lastRoleChange: "Last role change",
};

export const HA_STATUS_REPLICATION_LAG_WARN_SEC = 5;

export const HA_STATUS_LOAD_FAILED = "Failed to load HA status.";
