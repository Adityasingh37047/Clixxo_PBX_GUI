import React from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import {
  SIGNALING_CALL_TEST_LABELS,
  SIGNALING_CALL_TEST_TYPE_OPTIONS,
  SIGNALING_CALL_TEST_BUTTON_LABELS,
  SIGNALING_CALL_TEST_BUTTON_VARIANTS,
  SIGNALING_CALL_TEST_BUTTON_STYLE,
  SIGNALING_CALL_TEST_TOOLTIPS,
  SIGNALING_CALL_TEST_BREADCRUMB,
  SIGNALING_CALL_TEST_CARD_TITLE,
  SIGNALING_CALL_TEST_SECTION_CONFIG,
  SIGNALING_CALL_TEST_SECTION_OUTPUT,
  SIGNALING_CALL_TEST_OUTPUT_PLACEHOLDER,
  SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  SIGNALING_CALL_TEST_FIELD_COL_GAP,
} from "../../../../constants/SignalingCallTestConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  SIGNALING_CALL_TEST_SCROLL_CLASS,
  SIGNALING_CALL_TEST_COMPACT_MQ,
  signalingCallTestPageWrapStyle,
  signalingCallTestPageInnerStyle,
  signalingCallTestTableContainerStyle,
  signalingCallTestHeaderStyle,
  signalingCallTestBodyStyle,
  signalingCallTestFixedAlertSx,
  signalingCallTestSectionHeadingColor,
  SIGNALING_CALL_TEST_OUTPUT_BODY_BG,
  FIELD_RADIUS,
} from "./SignalingCallTestTableHelpers";

export {
  SIGNALING_CALL_TEST_SCROLL_CLASS,
  SIGNALING_CALL_TEST_COMPACT_MQ,
  signalingCallTestFixedAlertSx,
};

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

export const signalingCallTestInputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const signalingCallTestInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  outline: "none",
  background: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  fontSize: 13,
  lineHeight: 1.35,
  minHeight: 36,
  height: 36,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

export const signalingCallTestSelectStyle = {
  ...signalingCallTestInputStyle,
  appearance: "auto",
  paddingTop: 7,
  paddingBottom: 7,
  cursor: "pointer",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#333",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 500,
        padding: "10px 12px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const sctFieldRowStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  width: "100%",
  gap: SIGNALING_CALL_TEST_FIELD_COL_GAP,
};

const sctFieldLabelWrapStyle = {
  flex: `0 0 ${SIGNALING_CALL_TEST_LABEL_COL_WIDTH}px`,
  width: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  minWidth: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  maxWidth: SIGNALING_CALL_TEST_LABEL_COL_WIDTH,
  paddingTop: 9,
};

const sctFieldControlWrapStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  width: "100%",
};

export const SignalingCallTestFieldRow = ({ name, label, children }) => {
  const tooltip = SIGNALING_CALL_TEST_TOOLTIPS[name];
  const labelNode = (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: "100%",
        lineHeight: 1.4,
        wordBreak: "break-word",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {label}
    </label>
  );

  return (
    <div style={sctFieldRowStyle}>
      <div style={sctFieldLabelWrapStyle}>
        {tooltip ? (
          <Tooltip title={tooltip} {...tooltipProps}>
            {labelNode}
          </Tooltip>
        ) : (
          labelNode
        )}
      </div>
      <div style={sctFieldControlWrapStyle}>{children}</div>
    </div>
  );
};

export const SignalingCallTestPageShell = ({ children }) => (
  <div
    className={SIGNALING_CALL_TEST_SCROLL_CLASS}
    style={signalingCallTestPageWrapStyle}
    data-native-scroll
  >
    <div style={signalingCallTestPageInnerStyle}>{children}</div>
  </div>
);

export const SignalingCallTestBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIGNALING_CALL_TEST_BREADCRUMB[0]}
    section={SIGNALING_CALL_TEST_BREADCRUMB[1]}
    current={SIGNALING_CALL_TEST_BREADCRUMB[2]}
  />
);

const sctFieldsGridStyle = (isCompact) => ({
  display: "grid",
  gridTemplateColumns: isCompact ? "1fr" : "1fr 1fr",
  gap: isCompact ? 16 : 24,
  width: "100%",
  alignItems: "start",
});

const sctFieldsColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minWidth: 0,
};

export const SignalingCallTestCard = ({
  isCompact,
  outputRef,
  testType,
  trunkGroup,
  trunkGroupOptions,
  callerId,
  calledId,
  originalCallee,
  trace,
  busy,
  isRunning,
  canStart,
  hasClearableData,
  onTestTypeChange,
  onTrunkGroupChange,
  onCallerIdChange,
  onCalledIdChange,
  onOriginalCalleeChange,
  onStart,
  onClear,
}) => (
  <div style={signalingCallTestTableContainerStyle}>
    <div style={signalingCallTestHeaderStyle}>
      <span>{SIGNALING_CALL_TEST_CARD_TITLE}</span>
    </div>

    <div style={signalingCallTestBodyStyle}>
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${C.divider}`,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            padding: "14px 18px",
            borderBottom: `1px solid ${C.divider}`,
            background: "#ffffff",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: signalingCallTestSectionHeadingColor,
              letterSpacing: "0.01em",
            }}
          >
            {SIGNALING_CALL_TEST_SECTION_CONFIG}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Btn
              variant={SIGNALING_CALL_TEST_BUTTON_VARIANTS.PRIMARY}
              type="button"
              onClick={onStart}
              disabled={busy || isRunning || !canStart}
              style={SIGNALING_CALL_TEST_BUTTON_STYLE}
            >
              {busy ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CircularProgress size={12} color="inherit" />
                  {SIGNALING_CALL_TEST_BUTTON_LABELS.STARTING}
                </span>
              ) : (
                SIGNALING_CALL_TEST_BUTTON_LABELS.START
              )}
            </Btn>
          </div>
        </div>

        <div style={{ padding: "18px 18px 20px" }}>
          <div style={sctFieldsGridStyle(isCompact)}>
            <div style={sctFieldsColumnStyle}>
              <SignalingCallTestFieldRow
                name="testType"
                label={SIGNALING_CALL_TEST_LABELS.testType}
              >
                <select
                  style={signalingCallTestSelectStyle}
                  value={testType}
                  onChange={(e) => onTestTypeChange(e.target.value)}
                  {...signalingCallTestInputInteraction}
                >
                  {SIGNALING_CALL_TEST_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </SignalingCallTestFieldRow>

              <SignalingCallTestFieldRow
                name="trunkGroup"
                label={SIGNALING_CALL_TEST_LABELS.trunkGroup}
              >
                <select
                  style={signalingCallTestSelectStyle}
                  value={trunkGroup}
                  onChange={(e) => onTrunkGroupChange(e.target.value)}
                  {...signalingCallTestInputInteraction}
                >
                  {trunkGroupOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </SignalingCallTestFieldRow>

              <SignalingCallTestFieldRow
                name="callerId"
                label={SIGNALING_CALL_TEST_LABELS.callerId}
              >
                <input
                  type="text"
                  style={signalingCallTestInputStyle}
                  value={callerId}
                  onChange={(e) => onCallerIdChange(e.target.value)}
                  {...signalingCallTestInputInteraction}
                />
              </SignalingCallTestFieldRow>
            </div>

            <div style={sctFieldsColumnStyle}>
              <SignalingCallTestFieldRow
                name="calledId"
                label={SIGNALING_CALL_TEST_LABELS.calledId}
              >
                <input
                  type="text"
                  style={signalingCallTestInputStyle}
                  value={calledId}
                  onChange={(e) => onCalledIdChange(e.target.value)}
                  {...signalingCallTestInputInteraction}
                />
              </SignalingCallTestFieldRow>

              <SignalingCallTestFieldRow
                name="originalCallee"
                label={SIGNALING_CALL_TEST_LABELS.originalCallee}
              >
                <input
                  type="text"
                  style={signalingCallTestInputStyle}
                  value={originalCallee}
                  onChange={(e) => onOriginalCalleeChange(e.target.value)}
                  {...signalingCallTestInputInteraction}
                />
              </SignalingCallTestFieldRow>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${C.divider}`,
          borderRadius: 4,
          overflow: "hidden",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            padding: "12px 16px",
            borderBottom: `1px solid ${C.divider}`,
            background: "#ffffff",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: signalingCallTestSectionHeadingColor,
            }}
          >
            {SIGNALING_CALL_TEST_SECTION_OUTPUT}
          </span>
          <Btn
            variant={SIGNALING_CALL_TEST_BUTTON_VARIANTS.CANCEL}
            type="button"
            onClick={onClear}
            disabled={busy || !hasClearableData}
            style={SIGNALING_CALL_TEST_BUTTON_STYLE}
          >
            {SIGNALING_CALL_TEST_BUTTON_LABELS.CLEAR}
          </Btn>
        </div>
        <div
          style={{
            backgroundColor: SIGNALING_CALL_TEST_OUTPUT_BODY_BG,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            overflow: "hidden",
          }}
        >
          <textarea
            ref={outputRef}
            className={SIGNALING_CALL_TEST_SCROLL_CLASS}
            style={{
              display: "block",
              width: "100%",
              minHeight: 200,
              maxHeight: 320,
              margin: 0,
              padding: "12px 16px 16px",
              border: "none",
              borderRadius: 0,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
              fontSize: 13,
              lineHeight: 1.6,
              fontFamily: "monospace",
              color: C.labelText,
              backgroundColor: "transparent",
              whiteSpace: "pre-wrap",
              cursor: "default",
            }}
            value={trace}
            readOnly
            tabIndex={-1}
            placeholder={SIGNALING_CALL_TEST_OUTPUT_PLACEHOLDER}
            onFocus={(e) => e.target.blur()}
          />
        </div>
      </div>
    </div>
  </div>
);
