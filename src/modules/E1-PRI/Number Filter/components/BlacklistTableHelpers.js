import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as BLACKLIST_CARD_RADIUS,
  extensionPageInnerStyle as blacklistPageInnerStyle,
  extensionPageWrapStyle as blacklistPageWrapStyle,
  getExtensionRowBg as getBlacklistRowBg,
} from "../../../../components/common";

export {
  BLACKLIST_CARD_RADIUS,
  blacklistPageInnerStyle,
  blacklistPageWrapStyle,
  getBlacklistRowBg,
};

export const getBlacklistEditIconStyle = (isDeleting) => ({
  cursor: isDeleting ? "not-allowed" : "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: isDeleting ? 0.4 : 0.7,
  transition: "opacity 0.15s ease",
});

export const handleBlacklistEditIconHover = (
  e,
  entering,
  isDeleting = false,
) => {
  if (isDeleting) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const blacklistPanelCardStyle = {
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: BLACKLIST_CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
};

export const blacklistPanelToolbarStyle = {
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

export const blacklistPanelSectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  letterSpacing: "-0.01em",
};

export const blacklistPanelFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
};

export const blacklistPanelNoteStyle = {
  color: C.accent,
  fontSize: 11,
  lineHeight: 1.5,
  margin: "16px 0 0",
  padding: "0 4px",
  textAlign: "center",
  width: "100%",
  boxSizing: "border-box",
};

export const blacklistHeaderCheckThStyle = {
  padding: "1px 14px",
  lineHeight: 1,
};

export const blacklistSelectedBadgeStyle = {
  background: "#eff6ff",
  color: C.accent,
  fontSize: 11,
  fontWeight: 700,
  padding: "4px 10px",
  borderRadius: 999,
  border: `1px solid #3a4a5e`,
};

export const blacklistLoadingWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: 64,
  flexDirection: "column",
  gap: 12,
};

export const blacklistTableScrollStyle = {
  overflowX: "auto",
  overflowY: "auto",
  flex: 1,
  maxHeight: 360,
};
