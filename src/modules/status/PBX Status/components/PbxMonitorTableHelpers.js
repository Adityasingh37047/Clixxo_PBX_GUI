import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
  EXTENSION_COMPACT_MQ,
} from "../../../../theme/pbxTokens";
import {
  extensionPageWrapStyle,
  extensionPageInnerStyle,
  extensionCardStyle,
  extensionCancelBtnStyle,
  EXTENSION_TABLE_CARD_RADIUS,
  tdStyle as extensionTdStyle,
} from "../../../../components/common";

export { OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS };

export const pbxPageWrapStyle = extensionPageWrapStyle;
export const pbxPageInnerStyle = extensionPageInnerStyle;

export const PBX_MONITOR_COMPACT_MQ = EXTENSION_COMPACT_MQ;
export const PBX_MONITOR_EXTENSION_TABLE_MIN_WIDTH = 640;
export const PBX_MONITOR_TRUNK_TABLE_MIN_WIDTH = 520;
export const CARD_RADIUS = EXTENSION_TABLE_CARD_RADIUS;
export const PBX_MONITOR_TABLE_CARD_RADIUS = CARD_RADIUS;
export const PBX_MONITOR_FORM_HEADER_RADIUS = CARD_RADIUS;

export const pbxMonitorCardHeaderStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "10px 28px 10px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  borderTopLeftRadius: PBX_MONITOR_FORM_HEADER_RADIUS,
  borderTopRightRadius: PBX_MONITOR_FORM_HEADER_RADIUS,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const pbxMonitorHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

export const pbxMonitorHeaderToolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  marginLeft: "auto",
};

export const PBX_MONITOR_TOOLBAR_SEARCH_HEIGHT = 30;
export const PBX_MONITOR_TOOLBAR_SEARCH_WIDTH = 168;
export const PBX_MONITOR_SEARCH_ICON_SLOT = 18;
export const PBX_MONITOR_SEARCH_BAR_PADDING_FIT = 16;
export const PBX_MONITOR_SEARCH_BAR_PADDING_DEFAULT = 20;
export const PBX_MONITOR_TOOLBAR_SEARCH_FOCUS_RING = FOCUS_RING_SHADOW;
export const PBX_MONITOR_TOOLBAR_SEARCH_INPUT_FONT = {
  fontSize: 12,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "normal",
};

export const PBX_MONITOR_STAT_CARD_SHADOW =
  "0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.05)";

export const pbxMonitorCardStyle = extensionCardStyle;

export const pbxMonitorCancelBtnStyle = {
  ...extensionCancelBtnStyle,
  height: 30,
  borderRadius: 4,
};

export const pbxMonitorFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: PBX_MONITOR_TABLE_CARD_RADIUS,
  borderBottomRightRadius: PBX_MONITOR_TABLE_CARD_RADIUS,
};

export const PBX_MONITOR_TRUNK_ACCENT = "#8b5cf6";

export const STATUS_BADGE_WIDTH = 118;

export const tableWrapStyle = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
};

export const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

export const pbxMonitorTdStyle = {
  ...extensionTdStyle,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/** @deprecated use pbxMonitorTdStyle */
export const tdStyle = pbxMonitorTdStyle;
