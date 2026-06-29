// Port Group page constants

export const PORT_GROUP_PAGE_BREADCRUMB_ROOT = "FXS";
export const PORT_GROUP_PAGE_BREADCRUMB_SECTION = "Port";
export const PORT_GROUP_PAGE_BREADCRUMB_TITLE = "Port Group";
export const PORT_GROUP_CARD_TITLE = "Port Group";
export const PORT_GROUP_EMPTY_MESSAGE = "No available port group!";
export const PORT_GROUP_MODAL_TITLE_ADD = "Add Port Group";
export const PORT_GROUP_MODAL_TITLE_EDIT = "Edit Port Group";
export const PORT_GROUP_SAVE_LABEL = "Save";
export const PORT_GROUP_CLOSE_LABEL = "Close";

export const PORT_GROUP_TOTAL_PORTS = 32;

export const PORT_GROUP_TABLE_COLUMNS = [
  { key: 'check', label: 'Check' },
  { key: 'index', label: 'ID' },
  { key: 'description', label: 'Description' },
  { key: 'sipAccount', label: 'SIP Account' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'ports', label: 'Ports' },
  { key: 'portSelectMode', label: 'Port Select Mode' },
  { key: 'enumRule', label: 'Rule for Ringing by Turns' },
  { key: 'ringExpire', label: 'Timeout for Ringing by Turns (s)' },
  { key: 'robKey', label: 'Preemptive Answer Keyboard Shortcut' },
  { key: 'modify', label: 'Modify' },
];

export const PORT_GROUP_INDEX_OPTIONS = Array.from({ length: 32 }, (_, i) =>
  String(i + 1),
);

export const PORT_GROUP_REGISTER_OPTIONS = [
  { value: '0', label: 'NO' },
  { value: '1', label: 'YES' },
];

export const PORT_GROUP_AUTHENTICATION_MODE_OPTIONS = [
  { value: '0', label: 'Do Not Register' },
  { value: '3', label: 'Register Port' },
  { value: '2', label: 'Register Port Group' },
  { value: '1', label: 'Register Gateway' },
];

export const PORT_GROUP_SELECT_MODE_OPTIONS = [
  { value: '0', label: 'Increase' },
  { value: '1', label: 'Decrease' },
  { value: '2', label: 'Cyclic Increase' },
  { value: '3', label: 'Cyclic Decrease' },
  { value: '4', label: 'Group Ringing' },
  { value: '5', label: 'Ringing by Turns' },
];

export const PORT_GROUP_MULTI_GROUP_OPTIONS = [
  { value: '0', label: 'NO' },
  { value: '1', label: 'YES' },
];

export const PORT_GROUP_PAGE_TITLE = 'Port Group Settings';
export const PORT_GROUP_ADD_TITLE = 'Port Group-Add';

/** FXS Port Group modal form fields — PortGroupPage */
export const PORT_GROUP_FIELD_TOOLTIPS = {
  index:
    "Port group ID.\n" +
    "Options: 1 to 32.\n" +
    "Default on add: 1.",

  description:
    "Port group description label.\n" +
    "Required on save (validate on save).\n" +
    "Max length: 23 characters.\n" +
    "Default: default.",

  registerPortGroup:
    "Whether this port group registers with SIP.\n" +
    "Options: NO (0), YES (1).\n" +
    "When YES, SIP Account, Display Name, and Password fields are shown.",

  sipAccount:
    "SIP account for the port group.\n" +
    "Shown only when Register Port Group is YES.",

  displayName:
    "SIP display name for the port group.\n" +
    "Shown only when Register Port Group is YES.",

  password:
    "SIP authentication password.\n" +
    "Shown only when Register Port Group is YES.",

  registerSelectMode:
    "Authentication/registration mode (Authentication Mode field).\n" +
    "Options: Do Not Register (0), Register Gateway (1), Register Port Group (2), Register Port (3).",

  portSelectMode:
    "How incoming calls select a port within the group.\n" +
    "Options: Increase, Decrease, Cyclic Increase, Cyclic Decrease, Group Ringing, Ringing by Turns.\n" +
    "When Ringing by Turns (5), Rule and Timeout fields are shown.\n" +
    "When not Group Ringing (4) or Ringing by Turns (5), Preemptive Answer Keyboard Shortcut is shown.",

  enumRule:
    "Rule for ringing by turns.\n" +
    "Shown only when Port Select Mode is Ringing by Turns (5).",

  ringExpire:
    "Timeout for ringing by turns in seconds.\n" +
    "Shown only when Port Select Mode is Ringing by Turns (5).\n" +
    "Default: 20.",

  robKey:
    "Keyboard shortcut for preemptive answer.\n" +
    "Hidden when Port Select Mode is Group Ringing (4) or Ringing by Turns (5).",

  enablePortMultiGroup:
    "Allow a port to belong to multiple port groups.\n" +
    "Options: NO (0), YES (1).",

  ports:
    "FXS ports assigned to this group (1–32 checkboxes).\n" +
    "At least one port must be selected on save (validate on save).\n" +
    "Use Check All / Inverse to bulk-select.",
};

