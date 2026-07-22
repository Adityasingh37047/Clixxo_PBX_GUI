import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRI_IPCALLINCALLERID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriIPCallInCallerIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriIPCallInCallerIDFixedAlertSx,
  extensionPageInnerStyle as e1PriIPCallInCallerIDPageInnerStyle,
  extensionPageWrapStyle as e1PriIPCallInCallerIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriIPCallInCallerIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriIPCallInCallerIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriIPCallInCallerIDRowBg,
} from "../../../../components/common";

export {
  E1PRI_IPCALLINCALLERID_CARD_RADIUS,
  e1PriIPCallInCallerIDCancelBtnStyle,
  e1PriIPCallInCallerIDFixedAlertSx,
  e1PriIPCallInCallerIDPageInnerStyle,
  e1PriIPCallInCallerIDPageWrapStyle,
  e1PriIPCallInCallerIDToolbarBtnStyle,
  e1PriIPCallInCallerIDSelectedBadgeStyle,
  getE1PriIPCallInCallerIDRowBg,
};

export const e1PriIPCallInCallerIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getE1PriIPCallInCallerIDEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleE1PriIPCallInCallerIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriIPCallInCallerIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRI_IPCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINCALLERID_CARD_RADIUS,
};

export const e1PriIPCallInCallerIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRI_IPCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINCALLERID_CARD_RADIUS,
};

export const e1PriIPCallInCallerIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriIPCallInCallerIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
