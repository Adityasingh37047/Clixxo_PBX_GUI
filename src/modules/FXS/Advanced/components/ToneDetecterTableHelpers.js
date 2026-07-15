import { C } from "../../../../theme/pbxTokens";

export { extensionPageWrapStyle as toneDetecterPageWrapStyle, extensionPageInnerStyle as toneDetecterPageInnerStyle, extensionCardStyle as toneDetecterCardStyle, extensionToolbarStyle as toneDetecterHeaderStyle, extensionCancelBtnStyle as toneDetecterToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as toneDetecterToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as toneDetecterToolbarBtnStyle, extensionSelectedBadgeStyle as toneDetecterSelectedBadgeStyle, extensionPaginationStyle as toneDetecterPaginationStyle, extensionPageBadgeStyle as toneDetecterPaginationPageBadgeStyle, extensionFixedAlertSx as toneDetecterFixedAlertSx, EXTENSION_TABLE_CARD_RADIUS as TONE_DETECTER_CARD_RADIUS, TH as TH, tdStyle as tdStyle } from "../../../../components/common";





export const toneDetecterTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
};

export const toneDetecterEmptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
};

export const toneDetecterEmptyMessageStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const toneDetecterTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const toneDetecterPaginationInfoStyle = {
  fontSize: 11,
  color: C.mutedText,
};

export const toneDetecterPaginationNavBtnStyle = {
  borderRadius: 4,
};

export const PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };
export const PCM_TRUNK_GROUP_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };

export const PCM_TRUNK_GROUP_CHECKBOX_SX = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

export const getToneDetecterRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const toneDetecterEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleToneDetecterEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getToneDetecterLastRowCellStyle = (isLastRow) =>
  isLastRow ? { borderBottom: "none" } : {};
