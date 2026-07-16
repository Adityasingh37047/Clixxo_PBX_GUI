import { C } from "../../../../theme/pbxTokens";
import {
  extensionPageInnerStyle as e1PriPageInnerStyle,
  extensionPageWrapStyle as e1PriPageWrapStyle,
  extensionSelectedBadgeStyle,
} from "../../../../components/common";

export {
  getE1PriNumManipulateRowBg as getE1PriCallerIDReservePoolRowBg,
  e1PriNumManipulateEditIconStyle as e1PriCallerIDReservePoolEditIconStyle,
  handleE1PriNumManipulateEditIconHover as handleE1PriCallerIDReservePoolEditIconHover,
  e1PriNumManipulateEmptyWrapStyle as e1PriCallerIDReservePoolEmptyWrapStyle,
  e1PriNumManipulateEmptyTitleStyle as e1PriCallerIDReservePoolEmptyTitleStyle,
} from "./E1PriNumManipulateSharedTableHelpers";

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

export const e1PriCallerIDReservePoolSelectedBadgeStyle =
  extensionSelectedBadgeStyle;

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
