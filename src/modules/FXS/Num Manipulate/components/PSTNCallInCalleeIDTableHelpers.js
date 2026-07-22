import {
  EXTENSION_TABLE_CARD_RADIUS as PSTNCALLINCALLEEID_CARD_RADIUS,
  extensionSelectedBadgeStyle,
  extensionFixedAlertSx as pSTNCallInCalleeIDFixedAlertSx,
  extensionPageInnerStyle as pSTNCallInCalleeIDPageInnerStyle,
  extensionPageWrapStyle as pSTNCallInCalleeIDPageWrapStyle,
  extensionCancelBtnStyle as pSTNCallInCalleeIDToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as pSTNCallInCalleeIDToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as pSTNCallInCalleeIDToolbarBtnStyle,
  extensionPageBadgeStyle as pSTNCallInCalleeIDPageBadgeStyle,
} from "../../../../components/common";

export {
  PSTNCALLINCALLEEID_CARD_RADIUS,
  pSTNCallInCalleeIDFixedAlertSx,
  pSTNCallInCalleeIDPageInnerStyle,
  pSTNCallInCalleeIDPageWrapStyle,
  pSTNCallInCalleeIDToolbarCancelBtnStyle,
  pSTNCallInCalleeIDToolbarPrimaryBtnStyle,
  pSTNCallInCalleeIDToolbarBtnStyle,
  pSTNCallInCalleeIDPageBadgeStyle,
};

export const getPSTNCallInCalleeIDRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const pSTNCallInCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handlePSTNCallInCalleeIDEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const pSTNCallInCalleeIDSelectedBadgeStyle = () =>
  extensionSelectedBadgeStyle;

export const pSTNCallInCalleeIDLoadingWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 280,
  borderBottomLeftRadius: PSTNCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: PSTNCALLINCALLEEID_CARD_RADIUS,
};

export const pSTNCallInCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: PSTNCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: PSTNCALLINCALLEEID_CARD_RADIUS,
};

export const pSTNCallInCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const pSTNCallInCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
};
