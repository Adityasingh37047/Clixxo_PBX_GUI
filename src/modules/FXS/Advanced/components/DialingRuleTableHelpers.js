export { extensionPageWrapStyle as dialingRulePageWrapStyle, extensionPageInnerStyle as dialingRulePageInnerStyle, extensionCardStyle as dialingRuleCardStyle, extensionToolbarStyle as dialingRuleHeaderStyle, extensionCancelBtnStyle as dialingRuleToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as dialingRuleToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as dialingRuleToolbarBtnStyle, extensionSelectedBadgeStyle as dialingRuleSelectedBadgeStyle, extensionPaginationStyle as dialingRulePaginationStyle, extensionPageBadgeStyle as dialingRulePaginationPageBadgeStyle, extensionFixedAlertSx as dialingRuleFixedAlertSx, EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS, TH as TH, tdStyle as tdStyle } from "../../../../components/common";



export const dialingRuleTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
};

export const dialingRuleTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const dialingRuleEmptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
};

export const dialingRuleEmptyMessageStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };
export const PCM_TRUNK_GROUP_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };

export const dialingRuleTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const getDialingRuleRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const DIALING_RULE_ROW_HOVER_BG = "#f1f5f9";

export const handleDialingRuleRowHover = (e, isSelected, rowBg, entering) => {
  if (!isSelected) {
    e.currentTarget.style.background = entering
      ? DIALING_RULE_ROW_HOVER_BG
      : rowBg;
  }
};

export const dialingRuleEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleDialingRuleEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};
