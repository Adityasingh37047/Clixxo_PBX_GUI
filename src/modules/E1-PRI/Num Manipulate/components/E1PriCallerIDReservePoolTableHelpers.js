import { C } from "../../../../theme/pbxTokens";
import {
  EXTENSION_TABLE_CARD_RADIUS as E1PRICALLERIDRESERVEPOOL_CARD_RADIUS,
  extensionPageInnerStyle as e1PriPageInnerStyle,
  extensionPageWrapStyle as e1PriPageWrapStyle,
  extensionSelectedBadgeStyle as e1PriCallerIDReservePoolSelectedBadgeStyle,
  getExtensionRowBg as getE1PriCallerIDReservePoolRowBg,
} from "../../../../components/common";

export {
  E1PRICALLERIDRESERVEPOOL_CARD_RADIUS,
  e1PriCallerIDReservePoolSelectedBadgeStyle,
  getE1PriCallerIDReservePoolRowBg,
};

export const e1PriCallerIDReservePoolEditIconStyle = {
  cursor: "pointer",
  color: "#2563eb",
  fontSize: 22,
  opacity: 0.7,
  transition: "opacity 0.15s ease",
};

export const handleE1PriCallerIDReservePoolEditIconHover = (
  e,
  entering,
  loadingDelete = false,
) => {
  if (loadingDelete) return;
  e.currentTarget.style.opacity = entering ? "1" : "0.7";
};

export const e1PriCallerIDReservePoolEmptyWrapStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 240,
  padding: 24,
  textAlign: "center",
  borderBottomLeftRadius: E1PRICALLERIDRESERVEPOOL_CARD_RADIUS,
  borderBottomRightRadius: E1PRICALLERIDRESERVEPOOL_CARD_RADIUS,
};

export const e1PriCallerIDReservePoolEmptyTitleStyle = {
  color: "#3E5475",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};

export const e1PriCallerIDReservePoolPageWrapStyle = {
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

export const e1PriCallerIDReservePoolPageInnerStyle = {
  ...e1PriPageInnerStyle,
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

export const e1PriCallerIDReservePoolFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  background: "#ffffff",
  borderTop: `1px solid ${C.divider}`,
};

export const e1PriCallerIDReservePoolNoteStyle = {
  color: C.amber,
  fontSize: 11,
  lineHeight: 1.5,
  margin: "16px 0 0",
  padding: "0 4px",
  textAlign: "center",
};
