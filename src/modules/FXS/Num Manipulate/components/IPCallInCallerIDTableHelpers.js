import {
  EXTENSION_TABLE_CARD_RADIUS as IPCALLINCALLERID_CARD_RADIUS,
  extensionSelectedBadgeStyle,
  extensionFixedAlertSx as iPCallInCallerIDFixedAlertSx,
  extensionPageInnerStyle as iPCallInCallerIDPageInnerStyle,
  extensionPageWrapStyle as iPCallInCallerIDPageWrapStyle,
  extensionCancelBtnStyle as iPCallInCallerIDToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as iPCallInCallerIDToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as iPCallInCallerIDToolbarBtnStyle,
  extensionPageBadgeStyle as iPCallInCallerIDPageBadgeStyle,
} from "../../../../components/common";

export {
  IPCALLINCALLERID_CARD_RADIUS,
  iPCallInCallerIDFixedAlertSx,
  iPCallInCallerIDPageInnerStyle,
  iPCallInCallerIDPageWrapStyle,
  iPCallInCallerIDToolbarCancelBtnStyle,
  iPCallInCallerIDToolbarPrimaryBtnStyle,
  iPCallInCallerIDToolbarBtnStyle,
  iPCallInCallerIDPageBadgeStyle,
};

export const getIPCallInCallerIDRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const iPCallInCallerIDEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleIPCallInCallerIDEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const iPCallInCallerIDSelectedBadgeStyle = () =>
  extensionSelectedBadgeStyle;

export const iPCallInCallerIDLoadingWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 280,
  borderBottomLeftRadius: IPCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: IPCALLINCALLERID_CARD_RADIUS,
};

export const iPCallInCallerIDEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: IPCALLINCALLERID_CARD_RADIUS,
  borderBottomRightRadius: IPCALLINCALLERID_CARD_RADIUS,
};

export const iPCallInCallerIDEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const iPCallInCallerIDTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
};
