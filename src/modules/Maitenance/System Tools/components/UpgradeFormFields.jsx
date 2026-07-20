import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { InfoOutlined } from "@mui/icons-material";
import { Alert, CircularProgress } from "@mui/material";
import {
  UPGRADE_LABELS,
  UPGRADE_BUTTON_LABELS,
  UPGRADE_BUTTON_VARIANTS,
  UPGRADE_BUTTON_STYLE,
  UPGRADE_BREADCRUMB,
  UPGRADE_STATUS,
  UPGRADE_BUTTON_STATUS,
  UPGRADE_MESSAGES,
} from "../../../../constants/UpgradeConstants";
import { C } from "../../../../theme/pbxTokens";
import { Btn } from "../../../../components/common";
import {
  upgradePageWrapStyle,
  upgradePageInnerStyle,
} from "./UpgradeTableHelpers";

const CARD_RADIUS = 4;
const FIELD_RADIUS = 6;

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: 0,
  display: "flex",
  flexDirection: "column",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  overflow: "hidden",
  boxSizing: "border-box",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.divider}`,
};
const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
};

const valueBoxStyle = {
  padding: "6px 12px",
  borderRadius: 6,
  border: `1px solid ${C.cardBorder}`,
  fontSize: 12,
  fontWeight: 500,
  width: "100%",
  minHeight: 34,
  backgroundColor: "#f8fafc",
  color: C.valueText,
  textAlign: "center",
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const tooltipProps = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        fontSize: 12,
        maxWidth: 500,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
    arrow: {
      sx: {
        color: "#fff",
      },
    },
  },
};

export const UpgradePageView = (props) => {
  const {
    error,
    fileInputRef,
    fileName,
    handleFileChange,
    handleReset,
    handleUpdate,
    progressMessage,
    rebooting,
    setError,
    setSuccess,
    success,
    uploading,
    versionLoading,
    versionRows,
  } = props;


  return (
    <div
      style={upgradePageWrapStyle} data-native-scroll>
      <div style={upgradePageInnerStyle}>
      {(uploading || rebooting) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl px-10 py-6 flex flex-col items-center gap-4 max-w-sm text-center">
            <CircularProgress />
            <div className="text-gray-700 text-sm whitespace-pre-line">
              {progressMessage ||
                (rebooting
                  ? UPGRADE_MESSAGES.rebootingPleaseWait
                  : UPGRADE_MESSAGES.uploading)}
            </div>
          </div>
        </div>
      )}

        {/* ── Breadcrumb ── */}
        <div
          style={{
            fontSize: 12,
            color: C.mutedText,
            marginBottom: 16,
            fontWeight: 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span>{UPGRADE_BREADCRUMB[0]}</span>
          <span>&gt;</span>
          <span>{UPGRADE_BREADCRUMB[1]}</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            {UPGRADE_BREADCRUMB[2]}
          </span>
        </div>

        {/* Alerts */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              minWidth: 300,
              boxShadow: 3,
            }}
          >
            {success}
          </Alert>
        )}

        {/* Current Version */}
        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{UPGRADE_LABELS.currentVersion}</span>
            {versionLoading && (
              <CircularProgress size={16} sx={{ color: C.strongText }} />
            )}
          </div>
          <div
            className="w-full px-5 pt-3 pb-3 flex flex-col items-center"
            style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
          >
            <div
              className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 items-center"
            >
              {versionRows.map((row) => (
                <React.Fragment key={row.key}>
                  <Tooltip title={row.tooltip} {...tooltipProps}>
                    <label style={labelStyle}>{row.label}:</label>
                  </Tooltip>
                  <div className="flex flex-col min-w-0 w-full">
                    <div style={valueBoxStyle}>
                      {row.version || UPGRADE_STATUS.unavailable}
                    </div>
                    {row.timestamp ? (
                      <div
                        style={{
                          fontSize: 11,
                          color: C.mutedText,
                          marginTop: 4,
                          textAlign: "center",
                          lineHeight: 1.45,
                        }}
                      >
                        Last updated: {row.timestamp}
                      </div>
                    ) : null}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Select Update File + actions */}
        <div style={{ ...tableContainerStyle, marginTop: 20 }}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{UPGRADE_LABELS.selectFile}</span>
          </div>
          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            style={{ padding: "24px 20px" }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ flex: 1, minWidth: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading || rebooting}
              />
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.CHOOSE_FILE}
                type="button"
                onClick={() =>
                  !uploading && !rebooting && fileInputRef.current?.click()
                }
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {UPGRADE_BUTTON_LABELS.CHOOSE_FILE}
              </Btn>
              <span
                style={{
                  fontSize: 13,
                  color:
                    fileName === UPGRADE_LABELS.noFile
                      ? C.mutedText
                      : C.valueText,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {fileName}
              </span>
            </div>
            <div
              className="flex flex-row items-center gap-3"
              style={{ flexShrink: 0 }}
            >
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.UPDATE}
                type="button"
                onClick={handleUpdate}
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {uploading
                  ? UPGRADE_BUTTON_STATUS.uploading
                  : rebooting
                    ? UPGRADE_BUTTON_STATUS.rebooting
                    : UPGRADE_BUTTON_LABELS.UPDATE}
              </Btn>
              <Btn
                variant={UPGRADE_BUTTON_VARIANTS.RESET}
                type="button"
                onClick={handleReset}
                disabled={uploading || rebooting}
                style={UPGRADE_BUTTON_STYLE}
              >
                {UPGRADE_BUTTON_LABELS.RESET}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
