import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriIPCallInCalleeIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriIPCallInCalleeIDFixedAlertSx,
  extensionPageInnerStyle as e1PriIPCallInCalleeIDPageInnerStyle,
  extensionPageWrapStyle as e1PriIPCallInCalleeIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriIPCallInCalleeIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriIPCallInCalleeIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriIPCallInCalleeIDRowBg,
} from "../../../../components/common";

export {
  E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
  e1PriIPCallInCalleeIDCancelBtnStyle,
  e1PriIPCallInCalleeIDFixedAlertSx,
  e1PriIPCallInCalleeIDPageInnerStyle,
  e1PriIPCallInCalleeIDPageWrapStyle,
  e1PriIPCallInCalleeIDToolbarBtnStyle,
  e1PriIPCallInCalleeIDSelectedBadgeStyle,
  getE1PriIPCallInCalleeIDRowBg,
};

export const e1PriIPCallInCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const getE1PriIPCallInCalleeIDEditIconStyle = (loadingDelete) => ({
  cursor: loadingDelete ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: loadingDelete ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleE1PriIPCallInCalleeIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriIPCallInCalleeIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
};

export const e1PriIPCallInCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRI_IPCALLINCALLEEID_CARD_RADIUS,
};

export const e1PriIPCallInCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriIPCallInCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
