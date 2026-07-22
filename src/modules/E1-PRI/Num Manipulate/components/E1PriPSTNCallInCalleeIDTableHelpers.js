import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriPSTNCallInCalleeIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriPSTNCallInCalleeIDFixedAlertSx,
  extensionPageInnerStyle as e1PriPSTNCallInCalleeIDPageInnerStyle,
  extensionPageWrapStyle as e1PriPSTNCallInCalleeIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriPSTNCallInCalleeIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriPSTNCallInCalleeIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriPSTNCallInCalleeIDRowBg,
} from "../../../../components/common";

export {
  E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
  e1PriPSTNCallInCalleeIDCancelBtnStyle,
  e1PriPSTNCallInCalleeIDFixedAlertSx,
  e1PriPSTNCallInCalleeIDPageInnerStyle,
  e1PriPSTNCallInCalleeIDPageWrapStyle,
  e1PriPSTNCallInCalleeIDToolbarBtnStyle,
  e1PriPSTNCallInCalleeIDSelectedBadgeStyle,
  getE1PriPSTNCallInCalleeIDRowBg,
};

export const e1PriPSTNCallInCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleE1PriPSTNCallInCalleeIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriPSTNCallInCalleeIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
};

export const e1PriPSTNCallInCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINCALLEEID_CARD_RADIUS,
};

export const e1PriPSTNCallInCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriPSTNCallInCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
