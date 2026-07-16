import {
  EXTENSION_TABLE_CARD_RADIUS as CARD_RADIUS,
  extensionPageWrapStyle as signalingCallTestPageWrapStyle,
  extensionPageInnerStyle as signalingCallTestPageInnerStyle,
  extensionCardStyle as signalingCallTestCardStyle,
  extensionToolbarStyle as signalingCallTestToolbarStyle,
  extensionFixedAlertSx as signalingCallTestFixedAlertSxBase,
  extensionCancelBtnStyle as signalingCallTestCancelBtnStyle,
  extensionPrimaryBtnStyle as signalingCallTestPrimaryBtnStyle,
  addNewModalFooterBtnStyle as signalingCallTestFooterBtnStyle,
} from "../../../../components/common";
import { C } from "../../../../theme/pbxTokens";
import {
  SIGNALING_CALL_TEST_FORM_PAD_X,
  SIGNALING_CALL_TEST_SECTION_HEADING_COLOR,
} from "../../../../constants/SignalingCallTestConstants";

export const FIELD_RADIUS = 6;
export const SIGNALING_CALL_TEST_SCROLL_CLASS = "sct-scroll";
export const SIGNALING_CALL_TEST_COMPACT_MQ = "(max-width: 768px)";
export const SIGNALING_CALL_TEST_OUTPUT_BODY_BG = "#f1f5f9";

export const signalingCallTestFixedAlertSx = {
  ...signalingCallTestFixedAlertSxBase,
  maxWidth: 500,
  wordBreak: "break-word",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
  fontWeight: 500,
};

export const signalingCallTestTableContainerStyle = {
  ...signalingCallTestCardStyle,
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
};

export const signalingCallTestHeaderStyle = {
  ...signalingCallTestToolbarStyle,
  justifyContent: "flex-start",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
};

export const signalingCallTestBodyStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
  padding: `20px ${SIGNALING_CALL_TEST_FORM_PAD_X}px 24px`,
  background: C.cardBg,
  boxSizing: "border-box",
};

export const signalingCallTestSectionHeadingColor =
  SIGNALING_CALL_TEST_SECTION_HEADING_COLOR;

export {
  CARD_RADIUS,
  signalingCallTestPageWrapStyle,
  signalingCallTestPageInnerStyle,
  signalingCallTestCardStyle,
  signalingCallTestToolbarStyle,
  signalingCallTestCancelBtnStyle,
  signalingCallTestPrimaryBtnStyle,
  signalingCallTestFooterBtnStyle,
};
