import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as signalingCapturePageWrapStyle,
  extensionPageInnerStyle as signalingCapturePageInnerStyle,
  extensionCardStyle as signalingCaptureCardStyle,
  extensionToolbarStyle as signalingCaptureToolbarStyle,
  extensionFixedAlertSx as signalingCaptureFixedAlertSx,
  extensionCancelBtnStyle as signalingCaptureCancelBtnStyle,
  extensionPrimaryBtnStyle as signalingCapturePrimaryBtnStyle,
  addNewModalFooterBtnStyle as signalingCaptureFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";

export const FIELD_RADIUS = 6;

export const signalingCaptureTableContainerStyle = {
  ...signalingCaptureCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  border: `1.5px solid ${C.cardBorder}`,
  boxShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

export const signalingCaptureHeaderStyle = {
  ...signalingCaptureToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
};

export const signalingCaptureFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginTop: 20,
  padding: "10px 20px",
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 4,
  boxSizing: "border-box",
  background: C.cardBg,
  boxShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
};

export {
  CARD_RADIUS,
  signalingCapturePageWrapStyle,
  signalingCapturePageInnerStyle,
  signalingCaptureCardStyle,
  signalingCaptureToolbarStyle,
  signalingCaptureFixedAlertSx,
  signalingCaptureCancelBtnStyle,
  signalingCapturePrimaryBtnStyle,
  signalingCaptureFooterBtnStyle,
};
