import { EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS, extensionSelectedBadgeStyle, extensionCardStyle as fxsCardStyle, extensionFixedAlertSx as fxsFixedAlertSx, extensionPageBadgeStyle as fxsPageBadgeStyle, extensionPageInnerStyle as fxsPageInnerStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionPaginationStyle as fxsPaginationStyle, extensionToolbarStyle as fxsToolbarStyle, tdStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle } from "../../../../components/common";



export const ROUTE_TEL_TO_IP_CARD_RADIUS = FXS_CARD_RADIUS;

export const ROUTE_TEL_TO_IP_VALUE_TEXT = "#1f2937";

export const routeTelToIpPageWrapStyle = fxsPageWrapStyle;
export const routeTelToIpPageInnerStyle = fxsPageInnerStyle;
export const routeTelToIpCardStyle = fxsCardStyle;
export const routeTelToIpHeaderStyle = fxsToolbarStyle;

export const routeTelToIpTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

export const routeTelToIpPaginationStyle = fxsPaginationStyle;

export const routeTelToIpTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
  color: ROUTE_TEL_TO_IP_VALUE_TEXT,
};

export const routeTelToIpThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

export const ROUTE_TEL_TO_IP_PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };

export const routeTelToIpEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleRouteTelToIpEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getRouteTelToIpRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const routeTelToIpFixedAlertSx = fxsFixedAlertSx;

export const routeTelToIpSelectedBadgeStyle = () => extensionSelectedBadgeStyle;

export const routeTelToIpToolbarBtnStyle = fxsToolbarCancelBtnStyle;
export const routeTelToIpToolbarCancelBtnStyle = fxsToolbarCancelBtnStyle;
export const routeTelToIpToolbarPrimaryBtnStyle = fxsToolbarPrimaryBtnStyle;
export const routeTelToIpPageBadgeStyle = fxsPageBadgeStyle;

export const routeTelToIpEmptyStateTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const routeTelToIpEmptyStateWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
};

export const routeTelToIpPaginationCountStyle = {
  fontSize: 11,
  color: "#6b7280",
  lineHeight: 1.2,
};

export const fxsToolbarBtnStyle = fxsToolbarCancelBtnStyle;
