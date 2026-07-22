import {
  EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS, extensionSelectedBadgeStyle, extensionFixedAlertSx as fxsFixedAlertSx, extensionPageInnerStyle as fxsPageInnerStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as fxsToolbarBtnStyle,
  extensionPageBadgeStyle as numManipulatePageBadgeStyle,
} from "../../../../components/common";






export const getNumManipulateRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const numManipulateEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleNumManipulateEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const numManipulateFixedAlertSx = fxsFixedAlertSx;
export const numManipulatePageWrapStyle = fxsPageWrapStyle;
export const numManipulatePageInnerStyle = fxsPageInnerStyle;

export const numManipulateSelectedBadgeStyle = () => extensionSelectedBadgeStyle;

export const numManipulateToolbarBtnStyle = fxsToolbarBtnStyle;
export const numManipulateToolbarCancelBtnStyle = fxsToolbarCancelBtnStyle;
export const numManipulateToolbarPrimaryBtnStyle = fxsToolbarPrimaryBtnStyle;

export const numManipulateLoadingWrapStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 280,
  borderBottomLeftRadius: FXS_CARD_RADIUS,
  borderBottomRightRadius: FXS_CARD_RADIUS,
};

export const numManipulateEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: FXS_CARD_RADIUS,
  borderBottomRightRadius: FXS_CARD_RADIUS,
};

export const numManipulateEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const numManipulateTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  maxHeight: 460,
};

export { FXS_CARD_RADIUS as NUM_MANIPULATE_CARD_RADIUS };

export { numManipulatePageBadgeStyle };
