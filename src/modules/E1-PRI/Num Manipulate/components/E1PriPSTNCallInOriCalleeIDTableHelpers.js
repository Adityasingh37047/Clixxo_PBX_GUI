import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
  extensionCancelBtnStyle as e1PriPSTNCallInOriCalleeIDCancelBtnStyle,
  extensionFixedAlertSx as e1PriPSTNCallInOriCalleeIDFixedAlertSx,
  extensionPageInnerStyle as e1PriPSTNCallInOriCalleeIDPageInnerStyle,
  extensionPageWrapStyle as e1PriPSTNCallInOriCalleeIDPageWrapStyle,
  addNewModalFooterBtnStyle as e1PriPSTNCallInOriCalleeIDToolbarBtnStyle,
  extensionSelectedBadgeStyle as e1PriPSTNCallInOriCalleeIDSelectedBadgeStyle,
  getExtensionRowBg as getE1PriPSTNCallInOriCalleeIDRowBg,
} from "../../../../components/common";

export {
  E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
  e1PriPSTNCallInOriCalleeIDCancelBtnStyle,
  e1PriPSTNCallInOriCalleeIDFixedAlertSx,
  e1PriPSTNCallInOriCalleeIDPageInnerStyle,
  e1PriPSTNCallInOriCalleeIDPageWrapStyle,
  e1PriPSTNCallInOriCalleeIDToolbarBtnStyle,
  e1PriPSTNCallInOriCalleeIDSelectedBadgeStyle,
  getE1PriPSTNCallInOriCalleeIDRowBg,
};

export const e1PriPSTNCallInOriCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleE1PriPSTNCallInOriCalleeIDEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriPSTNCallInOriCalleeIDLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 48,
  borderBottomLeftRadius: E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
};

export const e1PriPSTNCallInOriCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
  borderBottomRightRadius: E1PRIPSTNCALLINORICALLEEID_CARD_RADIUS,
};

export const e1PriPSTNCallInOriCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriPSTNCallInOriCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 460,
};
