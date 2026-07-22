import {
  EXTENSION_TABLE_CARD_RADIUS as PSTNCALLINCALLERID_CARD_RADIUS,
  extensionSelectedBadgeStyle,
  extensionFixedAlertSx as pSTNCallInCallerIDFixedAlertSx,
  extensionPageInnerStyle as pSTNCallInCallerIDPageInnerStyle,
  extensionPageWrapStyle as pSTNCallInCallerIDPageWrapStyle,
  extensionCancelBtnStyle as pSTNCallInCallerIDToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as pSTNCallInCallerIDToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as pSTNCallInCallerIDToolbarBtnStyle,
  extensionPageBadgeStyle as pSTNCallInCallerIDPageBadgeStyle,
} from "../../../../components/common";

export {
  PSTNCALLINCALLERID_CARD_RADIUS,
  pSTNCallInCallerIDFixedAlertSx,
  pSTNCallInCallerIDPageInnerStyle,
  pSTNCallInCallerIDPageWrapStyle,
  pSTNCallInCallerIDToolbarCancelBtnStyle,
  pSTNCallInCallerIDToolbarPrimaryBtnStyle,
  pSTNCallInCallerIDToolbarBtnStyle,
  pSTNCallInCallerIDPageBadgeStyle,
};

export const getPSTNCallInCallerIDRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const pSTNCallInCallerIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePSTNCallInCallerIDEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pSTNCallInCallerIDSelectedBadgeStyle = () =>
  extensionSelectedBadgeStyle;

export const pSTNCallInCallerIDLoadingWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 280,
  borderBottomLeftRadius: PSTNCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: PSTNCALLINCALLERID_CARD_RADIUS,
};

export const pSTNCallInCallerIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: PSTNCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: PSTNCALLINCALLERID_CARD_RADIUS,
};

export const pSTNCallInCallerIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const pSTNCallInCallerIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
};
