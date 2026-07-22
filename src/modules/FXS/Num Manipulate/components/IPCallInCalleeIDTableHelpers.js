import {
  EXTENSION_TABLE_CARD_RADIUS as IPCALLINCALLEEID_CARD_RADIUS,
  extensionSelectedBadgeStyle,
  extensionFixedAlertSx as iPCallInCalleeIDFixedAlertSx,
  extensionPageInnerStyle as iPCallInCalleeIDPageInnerStyle,
  extensionPageWrapStyle as iPCallInCalleeIDPageWrapStyle,
  extensionCancelBtnStyle as iPCallInCalleeIDToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as iPCallInCalleeIDToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as iPCallInCalleeIDToolbarBtnStyle,
  extensionPageBadgeStyle as iPCallInCalleeIDPageBadgeStyle,
} from "../../../../components/common";

export {
  IPCALLINCALLEEID_CARD_RADIUS,
  iPCallInCalleeIDFixedAlertSx,
  iPCallInCalleeIDPageInnerStyle,
  iPCallInCalleeIDPageWrapStyle,
  iPCallInCalleeIDToolbarCancelBtnStyle,
  iPCallInCalleeIDToolbarPrimaryBtnStyle,
  iPCallInCalleeIDToolbarBtnStyle,
  iPCallInCalleeIDPageBadgeStyle,
};

export const getIPCallInCalleeIDRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const iPCallInCalleeIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleIPCallInCalleeIDEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const iPCallInCalleeIDSelectedBadgeStyle = () =>
  extensionSelectedBadgeStyle;

export const iPCallInCalleeIDLoadingWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 280,
  borderBottomLeftRadius: IPCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: IPCALLINCALLEEID_CARD_RADIUS,
};

export const iPCallInCalleeIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: IPCALLINCALLEEID_CARD_RADIUS,
  borderBottomRightRadius: IPCALLINCALLEEID_CARD_RADIUS,
};

export const iPCallInCalleeIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const iPCallInCalleeIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
};
