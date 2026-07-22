import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriPSTNCallInCallerIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriPSTNCallInCallerIDFixedAlertSx,
  extensionPageInnerStyle as e1PriPSTNCallInCallerIDPageInnerStyle,
  extensionPageWrapStyle as e1PriPSTNCallInCallerIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriPSTNCallInCallerIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriPSTNCallInCallerIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriPSTNCallInCallerIDRowBg,
} from "../../../../components/common";

export {
  E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
  e1PriPSTNCallInCallerIDCancelBtnStyle,
  e1PriPSTNCallInCallerIDFixedAlertSx,
  e1PriPSTNCallInCallerIDPageInnerStyle,
  e1PriPSTNCallInCallerIDPageWrapStyle,
  e1PriPSTNCallInCallerIDToolbarBtnStyle,
  e1PriPSTNCallInCallerIDSelectedBadgeStyle,
  getE1PriPSTNCallInCallerIDRowBg,
};

export const e1PriPSTNCallInCallerIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleE1PriPSTNCallInCallerIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriPSTNCallInCallerIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
};

export const e1PriPSTNCallInCallerIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINCALLERID_CARD_RADIUS,
};

export const e1PriPSTNCallInCallerIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriPSTNCallInCallerIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
