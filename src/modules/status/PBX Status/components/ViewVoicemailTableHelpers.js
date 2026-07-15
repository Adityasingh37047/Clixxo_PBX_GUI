import {
  extensionPageWrapStyle as viewVoicemailPageWrapStyle,
  extensionPageInnerStyle as viewVoicemailPageInnerStyle,
} from "../../../../components/common";
import {
  C,
  FOCUS_RING_SHADOW,
  OUTLINED_BORDER,
  OUTLINED_FOCUS,
  OUTLINED_HOVER,
} from "../../../../theme/pbxTokens";

const CARD_RADIUS = 4;
const VIEW_VOICEMAIL_TABLE_CARD_RADIUS = CARD_RADIUS;
const VIEW_VOICEMAIL_CARD_SHADOW =
  "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)";
export const nativeFieldInteraction = {
  onFocus: (e) => {
    e.target.style.borderColor = OUTLINED_FOCUS;
    e.target.style.boxShadow = FOCUS_RING_SHADOW;
  },
  onBlur: (e) => {
    e.target.style.borderColor = OUTLINED_BORDER;
    e.target.style.boxShadow = "none";
  },
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = OUTLINED_HOVER;
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target) {
      e.target.style.borderColor = OUTLINED_BORDER;
      e.target.style.boxShadow = "none";
    }
  },
};

export { viewVoicemailPageWrapStyle, viewVoicemailPageInnerStyle };
export const viewVoicemailFilterCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
  padding: "10px 14px",
  marginBottom: 16,
};
export const viewVoicemailCardStyle = {
  background: C.cardBg,
  borderRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: VIEW_VOICEMAIL_CARD_SHADOW,
};
export const viewVoicemailToolbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  flexWrap: "wrap",
  gap: 8,
  borderTopLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderTopRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
};
export const viewVoicemailFilterFieldStyle = {
  height: 30,
  fontSize: 12,
  color: C.valueText,
  background: "#f8fafc",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 10,
  outline: "none",
  fontFamily: "Inter, sans-serif",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
};
export const viewVoicemailFilterLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.labelText,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};
export const viewVoicemailToolbarBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 4,
};
export const viewVoicemailRefreshBtnStyle = {
  height: 30,
  background: "#cbd5e1",
  color: "#374151",
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
  width: 70,
  boxSizing: "border-box",
  borderRadius: 4,
};
export const tdStyle = {
  padding: "7px 14px",
  fontSize: 13,
  color: C.valueText,
  textAlign: "center",
  borderBottom: `1px solid ${C.divider}`,
  borderRight: `1px solid ${C.divider}`,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
export const viewVoicemailTableCheckboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};
export const getViewVoicemailRowBg = (isSelected, idx) =>
  isSelected ? "#eff6ff" : idx % 2 === 1 ? "#f8fafc" : "#ffffff";
export const viewVoicemailFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: C.cardBg,
  borderTop: `1px solid ${C.divider}`,
  borderBottomLeftRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  borderBottomRightRadius: VIEW_VOICEMAIL_TABLE_CARD_RADIUS,
  overflow: "hidden",
  flexWrap: "wrap",
  gap: 10,
};
export const viewVoicemailPageBadgeStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: C.accent,
  background: "#eff6ff",
  padding: "5px 14px",
  borderRadius: 6,
  border: `0.5px solid ${C.cardBorder}`,
};
