import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRICALLERIDPOOL_CARD_RADIUS,
  extensionPageInnerStyle as e1PriPageInnerStyle,
  extensionPageWrapStyle as e1PriPageWrapStyle,
  getExtensionRowBg as getE1PriCallerIDPoolRowBg,
} from "../../../../components/common";

export { E1PRICALLERIDPOOL_CARD_RADIUS, getE1PriCallerIDPoolRowBg };

export const e1PriCallerIDPoolEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleE1PriCallerIDPoolEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriCallerIDPoolPageWrapStyle = {
  ...e1PriPageWrapStyle,
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

export const e1PriCallerIDPoolPageInnerStyle = {
  ...e1PriPageInnerStyle,
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

export const e1PriCallerIDPoolPanelCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: E1PRICALLERIDPOOL_CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

export const e1PriCallerIDPoolPanelToolbarStyle = {
  minHeight: 44,
  padding: "10px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 10,
  background: C.cardBg,
  borderBottom: `1px solid ${C.divider}`,
};

export const e1PriCallerIDPoolPanelSectionTitleStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: C.labelText,
  letterSpacing: "-0.01em",
};

export const e1PriCallerIDPoolPanelFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

export const e1PriCallerIDPoolTopControlsCardStyle = {
  ...e1PriCallerIDPoolPanelCardStyle,
  marginBottom: 16,
  flex: "none",
};

export const e1PriCallerIDPoolTopControlsBodyStyle = {
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

export const e1PriCallerIDPoolHeaderCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

export const e1PriCallerIDPoolSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.labelText,
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  border: `1px solid #3a4a5e`,
};

export const e1PriCallerIDPoolNoteStyle = {
  color: C.amber || "#dc2626",
  fontSize: 11,
  lineHeight: 1.5,
  margin: "0 0 16px",
  padding: "0 4px",
};
