import React from "react";
import { Checkbox } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import {
  SIGNALING_CAPTURE_SECTIONS,
  SIGNALING_CAPTURE_LABELS,
  SIGNALING_CAPTURE_PCM_OPTIONS,
  SIGNALING_CAPTURE_TS_OPTIONS,
  SIGNALING_CAPTURE_BUTTON_LABELS,
  SIGNALING_CAPTURE_BUTTON_VARIANTS,
  SIGNALING_CAPTURE_PRIMARY_BUTTON_STYLE,
  SIGNALING_CAPTURE_CANCEL_BUTTON_STYLE,
  SIGNALING_CAPTURE_FOOTER_BUTTON_STYLE,
  SIGNALING_CAPTURE_NOTE,
  SIGNALING_CAPTURE_TS_RECORD_PREFIX,
  SIGNALING_CAPTURE_E1_RECORD_PREFIX,
  SIGNALING_CAPTURE_BREADCRUMB,
  SIGNALING_CAPTURE_TOOLTIPS,
} from "../../../../constants/SignalingCaptureConstants";
import {
  C,
  OUTLINED_BORDER,
  OUTLINED_HOVER,
  OUTLINED_FOCUS,
  FOCUS_RING_SHADOW,
} from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  signalingCapturePageWrapStyle,
  signalingCapturePageInnerStyle,
  signalingCaptureTableContainerStyle,
  signalingCaptureHeaderStyle,
  signalingCaptureFooterStyle,
  signalingCaptureFixedAlertSx,
  FIELD_RADIUS,
} from "./SignalingCaptureTableHelpers";

export { signalingCaptureFixedAlertSx };

const SYSTEM_TOOLS_FILL_BG_EDITABLE = "#ffffff";
const SYSTEM_TOOLS_FILL_BG_READ_ONLY = "#f1f5f9";

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

export const inputInteraction = {
  onFocus: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldFocus(e.target);
  },
  onBlur: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    setFieldDefault(e.target);
  },
  onMouseEnter: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldHover(e.target);
    }
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) {
      setFieldFocus(e.target);
    } else {
      setFieldDefault(e.target);
    }
  },
};

export const signalingCaptureFieldInputStyle = {
  padding: "6px 12px",
  borderRadius: FIELD_RADIUS,
  border: `1px solid ${OUTLINED_BORDER}`,
  fontSize: 14,
  width: "100%",
  backgroundColor: SYSTEM_TOOLS_FILL_BG_EDITABLE,
  outline: "none",
  color: C.labelText,
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
  boxShadow: "none",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
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
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

export const SignalingCaptureFieldLabel = ({
  tooltipKey,
  className,
  style,
  children,
}) => {
  const tooltip = SIGNALING_CAPTURE_TOOLTIPS[tooltipKey];
  const labelNode = (
    <span
      style={{
        ...style,
        display: "inline-flex",
        width: "fit-content",
        cursor: tooltip ? "help" : "default",
      }}
    >
      {children}
    </span>
  );

  return (
    <div className={className} style={{ flexShrink: 0 }}>
      {tooltip ? (
        <Tooltip title={tooltip} {...tooltipProps}>
          {labelNode}
        </Tooltip>
      ) : (
        labelNode
      )}
    </div>
  );
};

export const SignalingCapturePageShell = ({ children }) => (
  <div style={signalingCapturePageWrapStyle} data-native-scroll>
    <div style={signalingCapturePageInnerStyle}>{children}</div>
  </div>
);

export const SignalingCaptureBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={SIGNALING_CAPTURE_BREADCRUMB[0]}
    section={SIGNALING_CAPTURE_BREADCRUMB[1]}
    current={SIGNALING_CAPTURE_BREADCRUMB[2]}
  />
);

export const SignalingCaptureDataSection = ({
  network,
  networkOptions,
  loading,
  syslogEnabled,
  syslogDest,
  dataCaptureLocked,
  anySlotRecording,
  isCapturing,
  isStopping,
  captureStatus,
  onNetworkChange,
  onSyslogEnabledChange,
  onSyslogDestChange,
  onStartCapture,
  onStopCapture,
}) => (
  <div style={signalingCaptureTableContainerStyle}>
    <div style={signalingCaptureHeaderStyle}>
      <span>{SIGNALING_CAPTURE_SECTIONS[0]}</span>
    </div>
    <div className="flex flex-col p-6 gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <SignalingCaptureFieldLabel
              tooltipKey="networkInterface"
              className="sm:w-[280px] whitespace-nowrap"
              style={labelStyle}
            >
              {SIGNALING_CAPTURE_LABELS.networkInterface}
            </SignalingCaptureFieldLabel>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                style={{
                  ...signalingCaptureFieldInputStyle,
                  width: "100%",
                  minWidth: 220,
                }}
                value={network}
                onChange={(e) => onNetworkChange(e.target.value)}
                disabled={loading || dataCaptureLocked}
                {...inputInteraction}
              >
                {loading ? (
                  <option value="">Loading...</option>
                ) : (
                  networkOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 lg:ml-4">
            <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end">
              <Btn
                variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.PRIMARY}
                onClick={onStartCapture}
                disabled={dataCaptureLocked}
                style={SIGNALING_CAPTURE_PRIMARY_BUTTON_STYLE}
              >
                {SIGNALING_CAPTURE_BUTTON_LABELS.START}
              </Btn>
              <Btn
                variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.CANCEL}
                onClick={onStopCapture}
                disabled={!isCapturing || isStopping}
                style={SIGNALING_CAPTURE_CANCEL_BUTTON_STYLE}
              >
                {isStopping
                  ? SIGNALING_CAPTURE_BUTTON_LABELS.PLEASE_WAIT
                  : SIGNALING_CAPTURE_BUTTON_LABELS.STOP}
              </Btn>
            </div>
            {captureStatus && (
              <div
                style={{
                  fontSize: 12,
                  color: "#1d4ed8",
                  fontWeight: 600,
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  padding: "4px 12px",
                  whiteSpace: "nowrap",
                }}
              >
                {captureStatus}
              </div>
            )}
            {isCapturing && !isStopping && (
              <div
                style={{
                  fontSize: 11,
                  color: "#15803d",
                  fontWeight: 600,
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 6,
                  padding: "3px 10px",
                }}
              >
                ● Capturing…
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SignalingCaptureFieldLabel
            tooltipKey="captureSyslog"
            className="sm:w-[280px] whitespace-nowrap"
            style={labelStyle}
          >
            {SIGNALING_CAPTURE_LABELS.captureSyslog}
          </SignalingCaptureFieldLabel>
          <div className="flex items-center gap-2">
            <Checkbox
              size="small"
              checked={syslogEnabled}
              onChange={(e) => onSyslogEnabledChange(e.target.checked)}
              id="syslog-enable"
              disabled={dataCaptureLocked || anySlotRecording}
              sx={{
                padding: "4px",
                color: "#64748b",
                "&.Mui-checked": { color: C.accent },
                cursor:
                  dataCaptureLocked || anySlotRecording
                    ? "not-allowed"
                    : "pointer",
              }}
            />
            <label
              htmlFor="syslog-enable"
              style={{
                fontSize: 14,
                color: C.valueText,
                cursor:
                  dataCaptureLocked || anySlotRecording
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {SIGNALING_CAPTURE_LABELS.enable}
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <SignalingCaptureFieldLabel
            tooltipKey="syslogDest"
            className="sm:w-[280px] whitespace-nowrap"
            style={labelStyle}
          >
            {SIGNALING_CAPTURE_LABELS.syslogDest}
          </SignalingCaptureFieldLabel>
          <input
            type="text"
            value={syslogDest}
            onChange={(e) => onSyslogDestChange(e.target.value)}
            disabled={
              !syslogEnabled || dataCaptureLocked || anySlotRecording
            }
            style={{
              ...signalingCaptureFieldInputStyle,
              width: "100%",
              maxWidth: 220,
              backgroundColor:
                !syslogEnabled || dataCaptureLocked || anySlotRecording
                  ? SYSTEM_TOOLS_FILL_BG_READ_ONLY
                  : SYSTEM_TOOLS_FILL_BG_EDITABLE,
              opacity:
                !syslogEnabled || dataCaptureLocked || anySlotRecording
                  ? 0.6
                  : 1,
              cursor:
                !syslogEnabled || dataCaptureLocked || anySlotRecording
                  ? "not-allowed"
                  : "text",
            }}
            {...inputInteraction}
          />
        </div>

        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            whiteSpace: "nowrap",
            overflowX: "auto",
            lineHeight: 1.45,
          }}
        >
          {SIGNALING_CAPTURE_NOTE}
        </p>
      </div>
    </div>
  </div>
);

const SlotRecordingSection = ({
  sectionTitle,
  tooltipKey,
  rows,
  dataCaptureLocked,
  anySlotRecording,
  slotRecording,
  slotStopping,
  onStart,
  onStop,
}) => (
  <div style={{ ...signalingCaptureTableContainerStyle, marginTop: 20 }}>
    <div style={signalingCaptureHeaderStyle}>
      <span>{sectionTitle}</span>
    </div>
    <div className="p-6 flex flex-col gap-6">
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 last:pb-0"
          style={{
            borderBottom: i === 0 ? `1px solid ${C.divider}` : "none",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <SignalingCaptureFieldLabel
              tooltipKey={tooltipKey}
              className="sm:w-[280px] whitespace-nowrap"
              style={labelStyle}
            >
              {SIGNALING_CAPTURE_LABELS.pcmTs}
            </SignalingCaptureFieldLabel>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                style={{ ...signalingCaptureFieldInputStyle, minWidth: 100 }}
                value={row.pcm}
                onChange={(e) => row.onPcmChange(e.target.value)}
                disabled={
                  dataCaptureLocked ||
                  slotRecording[i] ||
                  slotStopping[i]
                }
                {...inputInteraction}
              >
                {SIGNALING_CAPTURE_PCM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <select
                style={{ ...signalingCaptureFieldInputStyle, minWidth: 180 }}
                value={row.slot}
                onChange={(e) => row.onSlotChange(e.target.value)}
                disabled={
                  dataCaptureLocked ||
                  slotRecording[i] ||
                  slotStopping[i]
                }
                {...inputInteraction}
              >
                {SIGNALING_CAPTURE_TS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-row flex-wrap gap-4 justify-start lg:justify-end mt-2 lg:mt-0">
            <Btn
              variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.PRIMARY}
              type="button"
              onClick={() => onStart(i, row.pcm, row.slot)}
              disabled={dataCaptureLocked || anySlotRecording}
              style={SIGNALING_CAPTURE_PRIMARY_BUTTON_STYLE}
            >
              {SIGNALING_CAPTURE_BUTTON_LABELS.START}
            </Btn>
            <Btn
              variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.CANCEL}
              type="button"
              onClick={() => onStop(i)}
              disabled={!slotRecording[i] || slotStopping[i]}
              style={SIGNALING_CAPTURE_CANCEL_BUTTON_STYLE}
            >
              {slotStopping[i]
                ? SIGNALING_CAPTURE_BUTTON_LABELS.PLEASE_WAIT
                : SIGNALING_CAPTURE_BUTTON_LABELS.STOP}
            </Btn>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SignalingCaptureTsSection = (props) => (
  <SlotRecordingSection
    sectionTitle={SIGNALING_CAPTURE_SECTIONS[1]}
    tooltipKey="pcmTs"
    {...props}
  />
);

export const SignalingCaptureE1Section = (props) => (
  <SlotRecordingSection
    sectionTitle={SIGNALING_CAPTURE_SECTIONS[2]}
    tooltipKey="e1PcmTs"
    {...props}
  />
);

export const SignalingCaptureFooter = ({
  isStopping,
  slotStopping,
  onCleanData,
  onDownloadLog,
}) => (
  <div style={signalingCaptureFooterStyle}>
    <Btn
      variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.PRIMARY}
      type="button"
      onClick={onCleanData}
      disabled={
        isStopping ||
        slotStopping.ts.some(Boolean) ||
        slotStopping.e1.some(Boolean)
      }
      style={SIGNALING_CAPTURE_FOOTER_BUTTON_STYLE}
    >
      {SIGNALING_CAPTURE_BUTTON_LABELS.CLEAN}
    </Btn>
    <Btn
      variant={SIGNALING_CAPTURE_BUTTON_VARIANTS.CANCEL}
      type="button"
      onClick={onDownloadLog}
      style={SIGNALING_CAPTURE_FOOTER_BUTTON_STYLE}
    >
      {SIGNALING_CAPTURE_BUTTON_LABELS.DOWNLOAD}
    </Btn>
  </div>
);

export { SIGNALING_CAPTURE_TS_RECORD_PREFIX, SIGNALING_CAPTURE_E1_RECORD_PREFIX };
