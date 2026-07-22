import { C } from "../../../../theme/pbxTokens";
import { COLOR_RING_TABLE_COLUMNS } from "../../../../constants/ColorRingConstants";

export { extensionTableCheckboxSx as COLOR_RING_CHECKBOX_SX } from "../../../../components/common";

export {
  extensionPageWrapStyle as colorRingPageWrapStyle,
  extensionPageInnerStyle as colorRingPageInnerStyle,
  extensionCardStyle as colorRingCardStyle,
  extensionToolbarStyle as colorRingHeaderStyle,
  extensionCancelBtnStyle as colorRingToolbarCancelBtnStyle,
  extensionPrimaryBtnStyle as colorRingToolbarPrimaryBtnStyle,
  addNewModalFooterBtnStyle as colorRingToolbarBtnStyle,
  extensionSelectedBadgeStyle as colorRingSelectedBadgeStyle,
  extensionPaginationStyle as colorRingPaginationStyle,
  extensionPageBadgeStyle as colorRingPaginationPageBadgeStyle,
  extensionFixedAlertSx as colorRingFixedAlertSx,
  EXTENSION_TABLE_CARD_RADIUS as COLOR_RING_CARD_RADIUS,
  TH,
  tdStyle,
} from "../../../../components/common";

export const DATA_COLUMNS = COLOR_RING_TABLE_COLUMNS.filter(
  (c) => c.key !== "check" && c.key !== "modify",
);

export const COLOR_RING_TH_GAP = { padding: "8px 14px" };
export const COLOR_RING_TD_GAP = { padding: "6px 14px", lineHeight: 1.2 };



export const colorRingTableBodyStyle = {
  overflowX: "auto",
  overflowY: "auto",
  width: "100%",
};

export const colorRingTableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
};

export const colorRingEmptyStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
};

export const colorRingEmptyMessageStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const colorRingPaginationInfoStyle = {
  fontSize: 11,
  color: C.mutedText,
};

export const colorRingPaginationBtnStyle = {
  borderRadius: 4,
};

export function getColorRingRowBg(isSelected, idx) {
  return isSelected ? "#f0f9ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
}

export const colorRingEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export function handleColorRingEditIconHover(e, entering) {
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
}
