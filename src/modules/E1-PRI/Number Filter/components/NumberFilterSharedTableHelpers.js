import { C } from "../../../../theme/pbxTokens";

import { EXTENSION_TABLE_CARD_RADIUS as E1_PRI_CARD_RADIUS, extensionCancelBtnStyle as e1PriCancelBtnStyle, extensionFixedAlertSx as e1PriFixedAlertSx, extensionPageInnerStyle as e1PriPageInnerStyle, extensionPageWrapStyle as e1PriPageWrapStyle, addNewModalFooterBtnStyle as e1PriToolbarBtnStyle, extensionSelectedBadgeStyle, getExtensionRowBg } from "../../../../components/common";



export const getNumberFilterRowBg = getExtensionRowBg;

export const numberFilterEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getNumberFilterEditIconStyle = (isDeleting) => ({
  cursor: isDeleting ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: isDeleting ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleNumberFilterEditIconHover = (
  e,
  entering,
  isDeleting = false,
) => {
  if (isDeleting) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const numberFilterFixedAlertSx = e1PriFixedAlertSx;
export const numberFilterPageWrapStyle = e1PriPageWrapStyle;
export const numberFilterPageInnerStyle = e1PriPageInnerStyle;
export const numberFilterSelectedBadgeStyle = extensionSelectedBadgeStyle;
export const numberFilterToolbarBtnStyle = e1PriToolbarBtnStyle;
export const numberFilterCancelBtnStyle = e1PriCancelBtnStyle;

export const numberFilterPanelCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: E1_PRI_CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

export const numberFilterPanelToolbarStyle = {
  minHeight: 44,
  padding: "10px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
};

export const numberFilterPanelSectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  letterSpacing: "-0.01em",
};

export const numberFilterPanelFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

export const numberFilterPanelNoteStyle = {
  color: C.accent,
  fontSize: 11,
  lineHeight: 1.5,
  margin: "16px 0 0",
  padding: "0 4px",
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box",
};

export const numberFilterHeaderCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

export const numberFilterDualPanelSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  border: `1px solid #3a4a5e`,
};

export const numberFilterLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 64,
  flexDirection: "column",
  gap: 12,
};

export const numberFilterEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1_PRI_CARD_RADIUS,
  borderBottomRightRadius: E1_PRI_CARD_RADIUS,
};

export const numberFilterEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const numberFilterTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 360,
};

export const numberFilterListTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
};

export const numberFilterListFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: E1_PRI_CARD_RADIUS,
  borderBottomRightRadius: E1_PRI_CARD_RADIUS,
  overflow: "hidden",
};

export { E1_PRI_CARD_RADIUS as NUMBER_FILTER_CARD_RADIUS };
export { C as numberFilterC };
