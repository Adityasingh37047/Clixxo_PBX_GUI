export const HA_STATUS_TITLE = "HA Status";

export const HA_STATUS_BREADCRUMB_SEGMENTS = [
  "Status",
  "PBX Status",
  "HA Status",
];

export const HA_STATUS_CARD_TITLE = "HA Status";
export const HA_STATUS_SECTION_LOCAL = "HA Status";
export const HA_STATUS_SECTION_PEER = "Peer Status";

export const HA_STATUS_BTN_REFRESH = "Refresh";
export const HA_STATUS_BTN_CONFIGURE = "Configure HA";
export const HA_STATUS_BTN_PHONE_CHECK = "phone-check";
export const HA_STATUS_BTN_CHECK = "check";
export const HA_STATUS_BTN_SYNC_DB = "sync-db";
export const HA_STATUS_BTN_CLEAR = "Clear";
export const HA_STATUS_BTN_RUNNING = "Running…";
export const HA_STATUS_OUTPUT_PLACEHOLDER = "Output will appear here…";
export const HA_STATUS_LOADING_TEXT = "Loading HA status…";

export const HA_STATUS_SYNC_DB_MODAL_TITLE = "Database sync";
export const HA_STATUS_SYNC_DB_MODAL_TEXT =
  "Seeding this server from the primary. This can take several minutes and will restart Asterisk. Please wait.";

export const HA_STATUS_NOT_ENABLED_HEADING = "HA is not enabled";

export const HA_STATUS_NOT_ENABLED_LINES = [
  "This server is running standalone. If it fails, calls stop until it is restored.",
  "With HA, a second server takes over automatically within seconds.",
  "Requires: a second Clixxo server on the same network, and one spare IP address.",
];

export const HA_STATUS_ROW_LABELS = {
  enabled: "Enabled",
  role: "Role",
  mode: "Mode",
  vip: "Virtual IP",
  interface: "Interface",
  peer: "Peer",
  peerStatus: "Peer status",
  keepalived: "Keepalived",
  asterisk: "Asterisk",
  health: "Health",
  replication: "Replication",
  replicationLag: "Replication lag",
  vpn: "VPN",
  certificate: "Certificate",
  contacts: "Contacts",
  trunks: "Trunks",
  reachable: "Reachable",
};

export const HA_STATUS_NODE_KEYS = [
  "enabled",
  "role",
  "mode",
  "vip",
  "interface",
  "peer",
  "peerStatus",
  "keepalived",
  "asterisk",
  "health",
  "replication",
  "replicationLag",
  "vpn",
  "certificate",
  "contacts",
  "trunks",
];

export const HA_STATUS_REPLICATION_LAG_WARN_SEC = 5;

export const HA_STATUS_LOAD_FAILED = "Failed to load HA status.";
export const HA_STATUS_PHONE_CHECK_FAILED = "phone-check failed.";
export const HA_STATUS_CHECK_FAILED = "check failed.";
export const HA_STATUS_SYNC_DB_FAILED = "sync-db failed.";
export const HA_STATUS_BUSY =
  "Another HA operation is already running. Please wait.";
export const HA_STATUS_SPLIT_BRAIN =
  "Split brain: both servers hold the Virtual IP. Apply HA settings on one server only.";
