import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as signalingCallTrackPageWrapStyle,
  extensionPageInnerStyle as signalingCallTrackPageInnerStyle,
  extensionCardStyle as signalingCallTrackCardStyle,
  extensionToolbarStyle as signalingCallTrackToolbarStyle,
  extensionFixedAlertSx as signalingCallTrackFixedAlertSxBase,
  extensionCancelBtnStyle as signalingCallTrackCancelBtnStyle,
  extensionPrimaryBtnStyle as signalingCallTrackPrimaryBtnStyle,
  addNewModalFooterBtnStyle as signalingCallTrackFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";
import {
  SIGNALING_CALL_TRACK_FORM_PAD_X,
  SIGNALING_CALL_TRACK_SECTION_HEADING_COLOR,
} from "../../../../constants/SignalingCallTrackConstants";

export const FIELD_RADIUS = 6;
export const SIGNALING_CALL_TRACK_SCROLL_CLASS = "sctrack-scroll";
export const SIGNALING_CALL_TRACK_OUTPUT_BODY_BG = "#f1f5f9";

export const signalingCallTrackFixedAlertSx = {
  ...signalingCallTrackFixedAlertSxBase,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

export const signalingCallTrackTableContainerStyle = {
  ...signalingCallTrackCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const signalingCallTrackHeaderStyle = {
  ...signalingCallTrackToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const signalingCallTrackBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  padding: `20px ${SIGNALING_CALL_TRACK_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export const signalingCallTrackSectionHeadingColor =
  SIGNALING_CALL_TRACK_SECTION_HEADING_COLOR;

export {
  CARD_RADIUS,
  signalingCallTrackPageWrapStyle,
  signalingCallTrackPageInnerStyle,
  signalingCallTrackCardStyle,
  signalingCallTrackToolbarStyle,
  signalingCallTrackCancelBtnStyle,
  signalingCallTrackPrimaryBtnStyle,
  signalingCallTrackFooterBtnStyle,
};
