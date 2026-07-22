import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriIPCallInOriCalleeIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriIPCallInOriCalleeIDFixedAlertSx,
  extensionPageInnerStyle as e1PriIPCallInOriCalleeIDPageInnerStyle,
  extensionPageWrapStyle as e1PriIPCallInOriCalleeIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriIPCallInOriCalleeIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriIPCallInOriCalleeIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriIPCallInOriCalleeIDRowBg,
} from "../../../../components/common";

export {
  E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
  e1PriIPCallInOriCalleeIDCancelBtnStyle,
  e1PriIPCallInOriCalleeIDFixedAlertSx,
  e1PriIPCallInOriCalleeIDPageInnerStyle,
  e1PriIPCallInOriCalleeIDPageWrapStyle,
  e1PriIPCallInOriCalleeIDToolbarBtnStyle,
  e1PriIPCallInOriCalleeIDSelectedBadgeStyle,
  getE1PriIPCallInOriCalleeIDRowBg,
};

export const e1PriIPCallInOriCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getE1PriIPCallInOriCalleeIDEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleE1PriIPCallInOriCalleeIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriIPCallInOriCalleeIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
};

export const e1PriIPCallInOriCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINORICALLEEID_CARD_RADIUS,
};

export const e1PriIPCallInOriCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriIPCallInOriCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
