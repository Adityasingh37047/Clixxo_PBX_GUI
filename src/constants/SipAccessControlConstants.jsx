export const SIP_ACCESS_CONTROL_COLUMNS = [
  { key: "checked", label: "Check", width: 60 },
  { key: "no", label: "ID", width: 60 },
  { key: "name", label: "Name", width: 180 },
  { key: "default", label: "Default", width: 140 },
  { key: "description", label: "Description", width: 260 },
  { key: "modify", label: "Modify", width: 80 },
];

export const SIP_ACCESS_CONTROL_DEFAULT_OPTIONS = [
  { value: "blacklist", label: "Blacklist" },
  { value: "whitelist", label: "Whitelist" },
];

export const SIP_ACCESS_CONTROL_MODAL_FIELDS = [
  { key: "name", label: "Name", type: "text", initial: "" },
  {
    key: "default",
    label: "Default",
    type: "select",
    options: SIP_ACCESS_CONTROL_DEFAULT_OPTIONS,
    initial: "blacklist",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    initial: "",
  },
];

export const SIP_ACCESS_CONTROL_INITIAL_ROW = {
  checked: false,
  no: 1,
  name: "",
  default: "blacklist",
  description: "",
};
