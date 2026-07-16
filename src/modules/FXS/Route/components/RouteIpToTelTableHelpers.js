import { EXTENSION_TABLE_CARD_RADIUS as FXS_CARD_RADIUS, extensionSelectedBadgeStyle, extensionCardStyle as fxsCardStyle, extensionFixedAlertSx as fxsFixedAlertSx, extensionPageBadgeStyle as fxsPageBadgeStyle, extensionPageInnerStyle as fxsPageInnerStyle, extensionPageWrapStyle as fxsPageWrapStyle, extensionPaginationStyle as fxsPaginationStyle, extensionToolbarStyle as fxsToolbarStyle, tdStyle, extensionCancelBtnStyle as fxsToolbarCancelBtnStyle, extensionPrimaryBtnStyle as fxsToolbarPrimaryBtnStyle } from "../../../../components/common";



export const ROUTE_IP_TO_TEL_CARD_RADIUS = FXS_CARD_RADIUS;

export const ROUTE_IP_TO_TEL_VALUE_TEXT = "#1f2937";

export const routeIpToTelPageWrapStyle = fxsPageWrapStyle;
export const routeIpToTelPageInnerStyle = fxsPageInnerStyle;
export const routeIpToTelCardStyle = fxsCardStyle;
export const routeIpToTelHeaderStyle = fxsToolbarStyle;

export const routeIpToTelTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
  boxSizing: "border-box",
};

export const routeIpToTelPaginationStyle = fxsPaginationStyle;

export const routeIpToTelTdStyle = {
  ...tdStyle,
  fontSize: 12,
  padding: "6px 8px",
  lineHeight: 1.2,
  color: ROUTE_IP_TO_TEL_VALUE_TEXT,
};

export const routeIpToTelThExtra = {
  fontSize: 10.5,
  padding: "9px 8px",
  letterSpacing: "0.04em",
};

export const ROUTE_IP_TO_TEL_PCM_TRUNK_GROUP_TH_GAP = { padding: "8px 14px" };

export const routeIpToTelEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleRouteIpToTelEditIconHover = (e, entering) => {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const getRouteIpToTelRowBg = (isSelected, idx) =>
  isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";

export const routeIpToTelFixedAlertSx = fxsFixedAlertSx;

export const routeIpToTelSelectedBadgeStyle = () => extensionSelectedBadgeStyle;

export const routeIpToTelToolbarBtnStyle = fxsToolbarCancelBtnStyle;
export const routeIpToTelToolbarCancelBtnStyle = fxsToolbarCancelBtnStyle;
export const routeIpToTelToolbarPrimaryBtnStyle = fxsToolbarPrimaryBtnStyle;
export const routeIpToTelPageBadgeStyle = fxsPageBadgeStyle;

export const routeIpToTelEmptyStateTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const routeIpToTelEmptyStateWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
};

export const routeIpToTelPaginationCountStyle = {
  fontSize: 11,
  color: "#6b7280",
  lineHeight: 1.2,
};

export const fxsToolbarBtnStyle = fxsToolbarCancelBtnStyle;
