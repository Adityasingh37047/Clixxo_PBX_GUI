import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../theme/pbxTokens";
import { CALL_COUNT_COLUMNS } from "../../../constants/CallCountConstants";
import { extensionCancelBtnStyle as callCountCancelBtnStyle } from "../../../components/common";

export const CARD_RADIUS = 4;
export const callCountToolbarFilterRefreshBtnStyle = {
  ...callCountCancelBtnStyle,
  width: 70,
  boxSizing: "border-box",
};
export const TRUNK_TABLE_SCROLL_CLASS = "trunk-table-scroll";
const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.borderWidth = "1px";
  el.style.boxShadow = "none";
};
const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.borderWidth = "1px";
  el.style.boxShadow = FOCUS_RING_SHADOW;
};
export const nativeFieldInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => setFieldDefault(e.target),
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};
const callCountCellPadding = "7px 6px";
const callCountHeaderPadding = "9px 6px";
const callCountCompactCellPadding = "7px 3px";
const callCountCompactHeaderPadding = "9px 3px";
export const callCountTableTdStyle = {
  fontSize: 13, color: C.valueText, textAlign: "center", background: "#ffffff",
  borderBottom: `1px solid ${C.divider}`, borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", boxSizing: "border-box",
};
export const callCountTableThStyle = { letterSpacing: "0.08em", boxSizing: "border-box" };
const columns = CALL_COUNT_COLUMNS;
export const getCallCountCellPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactCellPadding : callCountCellPadding;
};
export const getCallCountHeaderPadding = (key) => {
  const col = columns.find((c) => c.key === key);
  return col?.compact ? callCountCompactHeaderPadding : callCountHeaderPadding;
};
export const cardBorderSoft = C.divider;
export const callCountFilterModalPaperSx = {
  width: 660, maxWidth: "96vw", mx: "auto", p: 0, borderRadius: `${CARD_RADIUS}px`,
  overflow: "hidden", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};
export const callCountFilterModalTitleStyle = {
  background: "#1e2d42", color: "#ffffff", fontWeight: 600, fontSize: 16, textAlign: "center",
  padding: "16px 24px", borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS,
};
export const callCountFilterModalFormStyle = {
  width: "100%", background: "#f8fafc", border: `1px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS, padding: 20, boxSizing: "border-box",
};
export const callCountFilterModalFooterStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: 12, width: "100%",
  margin: 0, padding: "16px 24px", boxSizing: "border-box", background: "#f8fafc",
  borderTop: `1px solid ${C.cardBorder}`, borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};
export const callCountFilterModalFooterBtnStyle = {
  height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 4, minWidth: 100,
};
export const callCountFilterModalCancelBtnStyle = {
  ...callCountFilterModalFooterBtnStyle, background: "#cbd5e1", color: "#374151",
  border: "1px solid #cbd5e1", boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
};
const callCountFilterControlBase = {
  height: 36, fontSize: 13, color: C.valueText, background: "#ffffff",
  border: `1px solid ${OUTLINED_BORDER}`, borderRadius: 10, padding: "0 12px",
  outline: "none", fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease", boxSizing: "border-box", boxShadow: "none",
};
export const callCountFilterBoxStyle = { ...callCountFilterControlBase, width: "100%" };
export const callCountFilterBoxFillStyle = { ...callCountFilterControlBase, width: "100%", minWidth: 0 };
export const CALL_COUNT_FILTER_FIELD_MAX_WIDTH = 260;
export const CALL_COUNT_FILTER_TIME_RANGE_MAX_WIDTH = 260;
const CALL_COUNT_FILTER_COLUMN_GAP = 50;
export const callCountFilterModalGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? `${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px` : `${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px ${CALL_COUNT_FILTER_FIELD_MAX_WIDTH}px`,
  columnGap: CALL_COUNT_FILTER_COLUMN_GAP, rowGap: 8, width: "100%", justifyContent: "start",
});
export const callCountFilterFieldStyle = {
  width: "100%", minWidth: 0, maxWidth: CALL_COUNT_FILTER_FIELD_MAX_WIDTH,
};
export const CALL_COUNT_FILTER_TOOLTIP_PROPS = {
  arrow: true, placement: "top",
  slotProps: {
    tooltip: { sx: { backgroundColor: "#fff", color: "#333", border: "1px solid #d1d5db",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: 12, lineHeight: 1.45,
      maxWidth: 500, padding: "10px 12px", textTransform: "none", letterSpacing: "normal" } },
    arrow: { sx: { color: "#fff" } },
  },
};
