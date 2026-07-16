import React from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import {
  SIGNALING_CALL_TRACK_RADIO_OPTIONS,
  SIGNALING_CALL_TRACK_BUTTON_LABELS,
  SIGNALING_CALL_TRACK_BUTTON_VARIANTS,
  SIGNALING_CALL_TRACK_BUTTON_STYLE,
  SIGNALING_CALL_TRACK_TOOLTIPS,
  SIGNALING_CALL_TRACK_BREADCRUMB,
  SIGNALING_CALL_TRACK_CARD_TITLE,
  SIGNALING_CALL_TRACK_SECTION_OUTPUT,
  SIGNALING_CALL_TRACK_OUTPUT_PLACEHOLDER,
} from "../../../../constants/SignalingCallTrackConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  SIGNALING_CALL_TRACK_SCROLL_CLASS,
  signalingCallTrackPageWrapStyle,
  signalingCallTrackPageInnerStyle,
  signalingCallTrackTableContainerStyle,
  signalingCallTrackHeaderStyle,
  signalingCallTrackBodyStyle,
  signalingCallTrackFixedAlertSx,
  signalingCallTrackSectionHeadingColor,
  SIGNALING_CALL_TRACK_OUTPUT_BODY_BG,
  FIELD_RADIUS,
} from "./SignalingCallTrackTableHelpers";

export {
  SIGNALING_CALL_TRACK_SCROLL_CLASS,
  signalingCallTrackFixedAlertSx,
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

export const signalingCallTrackInputInteraction = {
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

export const signalingCallTrackInputStyle = {
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

export const SignalingCallTrackPageShell = ({ children }) => (
  <div
    className={SIGNALING_CALL_TRACK_SCROLL_CLASS}
    style={signalingCallTrackPageWrapStyle}
    data-native-scroll
  >
    <div style={signalingCallTrackPageInnerStyle}>{children}</div>
  </div>
);

export const SignalingCallTrackBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIGNALING_CALL_TRACK_BREADCRUMB[0]}
    section={SIGNALING_CALL_TRACK_BREADCRUMB[1]}
    current={SIGNALING_CALL_TRACK_BREADCRUMB[2]}
  />
);

export const SignalingCallTrackCard = ({
  outputRef,
  filterType,
  filterValue,
  trackMessage,
  busy,
  isTracking,
  hasTrackData,
  canFilter,
  onFilterTypeChange,
  onFilterValueChange,
  onStart,
  onStop,
  onFilter,
  onClear,
  onDownload,
}) => (
  <div style={signalingCallTrackTableContainerStyle}>
    <div style={signalingCallTrackHeaderStyle}>
      <span>{SIGNALING_CALL_TRACK_CARD_TITLE}</span>
    </div>

    <div style={signalingCallTrackBodyStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <RadioGroup
          value={filterType}
          onChange={(e) => onFilterTypeChange(e.target.value)}
          name="filterType"
          row
          style={{ gap: 16 }}
        >
          {SIGNALING_CALL_TRACK_RADIO_OPTIONS.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={
                <Radio
                  size="small"
                  sx={{
                    p: 0.5,
                    color: "#64748b",
                    "&.Mui-checked": { color: C.accent },
                  }}
                />
              }
              label={
                <Tooltip
                  title={SIGNALING_CALL_TRACK_TOOLTIPS.filterType}
                  {...tooltipProps}
                >
                  <span
                    style={{
                      fontSize: 14,
                      color: C.valueText,
                      fontWeight: 500,
                    }}
                  >
                    {opt.label}
                  </span>
                </Tooltip>
              }
              sx={{ margin: 0 }}
            />
          ))}
        </RadioGroup>
        <input
          type="text"
          value={filterValue}
          onChange={(e) => onFilterValueChange(e.target.value)}
          style={{
            ...signalingCallTrackInputStyle,
            minWidth: 120,
            maxWidth: 180,
            width: "auto",
          }}
          disabled={filterType === "none"}
          {...signalingCallTrackInputInteraction}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          gap: 16,
        }}
      >
        <Btn
          type="button"
          variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.PRIMARY}
          onClick={onStart}
          disabled={busy || isTracking}
          style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
        >
          {SIGNALING_CALL_TRACK_BUTTON_LABELS.START}
        </Btn>
        <Btn
          type="button"
          variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
          onClick={onStop}
          disabled={busy || !isTracking}
          style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
        >
          {SIGNALING_CALL_TRACK_BUTTON_LABELS.STOP}
        </Btn>
        <Btn
          type="button"
          variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
          onClick={onFilter}
          disabled={busy || !hasTrackData || !canFilter}
          style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
        >
          {SIGNALING_CALL_TRACK_BUTTON_LABELS.FILTER}
        </Btn>
        <Btn
          type="button"
          variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
          onClick={onClear}
          disabled={busy || !hasTrackData}
          style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
        >
          {SIGNALING_CALL_TRACK_BUTTON_LABELS.CLEAR}
        </Btn>
        <Btn
          type="button"
          variant={SIGNALING_CALL_TRACK_BUTTON_VARIANTS.CANCEL}
          onClick={onDownload}
          disabled={busy || !hasTrackData}
          style={SIGNALING_CALL_TRACK_BUTTON_STYLE}
        >
          {SIGNALING_CALL_TRACK_BUTTON_LABELS.DOWNLOAD}
        </Btn>
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
          <Tooltip
            title={SIGNALING_CALL_TRACK_TOOLTIPS.trackMessage}
            {...tooltipProps}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: signalingCallTrackSectionHeadingColor,
                cursor: "help",
              }}
            >
              {SIGNALING_CALL_TRACK_SECTION_OUTPUT}
            </span>
          </Tooltip>
        </div>
        <div
          style={{
            backgroundColor: SIGNALING_CALL_TRACK_OUTPUT_BODY_BG,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            overflow: "hidden",
          }}
        >
          <textarea
            ref={outputRef}
            className={SIGNALING_CALL_TRACK_SCROLL_CLASS}
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
            value={trackMessage}
            readOnly
            tabIndex={-1}
            placeholder={SIGNALING_CALL_TRACK_OUTPUT_PLACEHOLDER}
            onFocus={(e) => e.target.blur()}
          />
        </div>
      </div>
    </div>
  </div>
);
