import { C } from "../../../../theme/pbxTokens";
import {
  extensionPageWrapStyle as activeCallQueuePageWrapStyle,
  extensionPageInnerStyle as activeCallQueuePageInnerStyle,
  extensionCardStyle as activeCallQueueCardStyle,
  extensionToolbarStyle as activeCallQueueToolbarStyle,
  extensionCancelBtnStyle as activeCallQueueCancelBtnStyle,
  extensionPaginationStyle as activeCallQueueStatsFooterStyle,
  ExtensionToolbarSearchBar as ActiveCallQueueToolbarSearchBar,
  ExtensionTableListLoading as ActiveCallQueueTableListLoading,
  ExtensionTableListEmptyState as ActiveCallQueueTableListEmptyState,
  tdStyle as activeCallQueueTdStyle,
  getExtensionRowBg as getActiveCallQueueRowBg,
  EXTENSION_TABLE_CARD_RADIUS,
} from "../../../../components/common";

export const ACTIVE_CALL_QUEUE_TABLE_CARD_RADIUS = EXTENSION_TABLE_CARD_RADIUS;
export const ACTIVE_CALL_QUEUE_FORM_HEADER_RADIUS = EXTENSION_TABLE_CARD_RADIUS;

export const ACTIVE_CALL_QUEUE_STAT_CARD_SHADOW =
  "0 1px 3px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.05)";

export const activeCallQueueStatsCardStyle = {
  ...activeCallQueueCardStyle,
};

export const activeCallQueueStatsHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: ACTIVE_CALL_QUEUE_FORM_HEADER_RADIUS,
  borderTopRightRadius: ACTIVE_CALL_QUEUE_FORM_HEADER_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  flexWrap: "wrap",
  gap: 12,
  boxSizing: "border-box",
  flexShrink: 0,
};

export const activeCallQueueStatsHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

export const activeCallQueueStatsHeaderToolbarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
  flexWrap: "wrap",
  marginLeft: "auto",
};

export const activeCallQueuePrimaryBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};

export const activeCallQueueStatsToolbarBtnStyle = {
  ...activeCallQueueCancelBtnStyle,
  height: 30,
  fontSize: 12,
  margin: 0,
  padding: "6px 14px",
  lineHeight: 1,
  boxSizing: "border-box",
  minWidth: 84,
  width: 84,
};

export {
  activeCallQueuePageWrapStyle,
  activeCallQueuePageInnerStyle,
  activeCallQueueCardStyle,
  activeCallQueueToolbarStyle,
  activeCallQueueCancelBtnStyle,
  activeCallQueueStatsFooterStyle,
  ActiveCallQueueToolbarSearchBar,
  ActiveCallQueueTableListLoading,
  ActiveCallQueueTableListEmptyState,
  activeCallQueueTdStyle,
  getActiveCallQueueRowBg,
};
