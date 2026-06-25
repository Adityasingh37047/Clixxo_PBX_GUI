// HA page constants

export const HA_DEFAULTS = {
  enabled: false,
  virtualIp: '',
  primaryBackup: 'Primary',
  haEth: 'LAN 1:192.168.1.101',
};

export const HA_PRIMARY_BACKUP_OPTIONS = [
  'Primary',
  'Backup',
];

export const HA_ETH_OPTIONS = [
  'LAN 1:192.168.1.101',
  'LAN 2:192.168.0.101',
];

export const HA_LABELS = {
  ha: 'HA',
  virtualIp: 'Public Virtual IP',
  primaryBackup: 'Primary/Backup',
  haEth: 'HA Eth',
};

/** HA (HaPage) — local state only, alert on save */
export const HA_FIELD_TOOLTIPS = {
  enabled:
    "HA enable checkbox. Local state only.\n" +
    "When enabled, Public Virtual IP must be valid IPv4 before save.",
  virtualIp:
    "Public Virtual IP text field. Local state only.\n" +
    "Validated as IPv4 when HA is enabled. Disabled when HA is off.",
  primaryBackup:
    "Local state only. Options: Primary, Backup.\n" +
    "Disabled when HA is off. Default: Primary.",
  haEth:
    "Local state only. Options from HA_ETH_OPTIONS.\n" +
    "Disabled when HA is off.",
};
