import {
  PORT_GROUP_SELECT_MODE_OPTIONS,
  PORT_GROUP_TOTAL_PORTS,
} from "../../../../constants/PortGroupPageConstants";

export const initialPortGroupFormState = () => ({
  index: "1",
  description: "default",
  registerPortGroup: "0",
  sipAccount: "",
  displayName: "",
  password: "",
  authUserName: "",
  registerSelectMode: "0",
  portSelectMode: "0",
  enumRule: "",
  ringExpire: "20",
  robKey: "",
  enablePortMultiGroup: "0",
  ports: Array.from({ length: PORT_GROUP_TOTAL_PORTS }, () => false),
});

const portsStringToChecks = (portsStr) => {
  const selected = new Set(
    String(portsStr || "")
      .split(",")
      .map((s) => Number(String(s).trim()))
      .filter((n) => Number.isFinite(n) && n >= 1),
  );
  return Array.from({ length: PORT_GROUP_TOTAL_PORTS }, (_, i) =>
    selected.has(i + 1),
  );
};

const portSelectModeValueFromLabel = (label) =>
  PORT_GROUP_SELECT_MODE_OPTIONS.find((o) => o.label === label)?.value || "0";

export const portGroupFormFromRow = (group) => {
  const sipAccount =
    group.sipAccount && group.sipAccount !== "---" ? group.sipAccount : "";
  const displayName =
    group.displayName && group.displayName !== "---" ? group.displayName : "";
  const hasRegister = Boolean(sipAccount || displayName);
  const portSelectMode = portSelectModeValueFromLabel(group.portSelectMode);

  return {
    ...initialPortGroupFormState(),
    index: String(group.index ?? "1"),
    description: group.description || "default",
    registerPortGroup: hasRegister ? "1" : "0",
    sipAccount,
    displayName,
    portSelectMode,
    enumRule:
      group.enumRule && group.enumRule !== "---" ? group.enumRule : "",
    ringExpire:
      group.ringExpire && group.ringExpire !== "---"
        ? String(group.ringExpire)
        : "20",
    robKey: group.robKey && group.robKey !== "---" ? group.robKey : "",
    ports: portsStringToChecks(group.ports),
  };
};

export const buildPortGroupRow = (form, editingGroupId) => {
  const selectedPorts = form.ports
    .map((v, i) => (v ? i + 1 : null))
    .filter((n) => n !== null)
    .join(",");

  return {
    id: editingGroupId ?? Date.now(),
    index: form.index,
    description: form.description,
    sipAccount: form.registerPortGroup === "1" ? form.sipAccount : "---",
    displayName:
      form.registerPortGroup === "1" && form.displayName
        ? form.displayName
        : "---",
    ports: selectedPorts || "---",
    portSelectMode:
      PORT_GROUP_SELECT_MODE_OPTIONS.find(
        (o) => o.value === form.portSelectMode,
      )?.label || "",
    enumRule: form.portSelectMode === "5" ? form.enumRule || "---" : "---",
    ringExpire:
      form.portSelectMode === "5" ? form.ringExpire || "---" : "---",
    robKey:
      form.portSelectMode !== "4" &&
      form.portSelectMode !== "5" &&
      form.robKey
        ? form.robKey
        : "---",
  };
};

export const getSelectedPortGroupIds = (groups, checkedRows) =>
  groups.filter((g) => checkedRows[g.id]);
