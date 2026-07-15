import React from "react";
import {
  Alert,
  CircularProgress,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadIcon from "@mui/icons-material/Upload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  LICENSE_STATUS,
  LICENSE_STATUS_DISPLAY,
  LICENSE_BREADCRUMB,
  LICENSE_CARD_TITLE,
  LICENSE_SECTION_TITLES,
  LICENSE_FORM_LABELS,
  LICENSE_BUTTON_LABELS,
  LICENSE_BUTTON_VARIANTS,
  LICENSE_BUTTON_STYLE,
  LICENSE_CHOOSE_FILE_BUTTON_STYLE,
  LICENSE_ERROR_MESSAGES,
  LICENSE_SUCCESS_MESSAGES,
  LICENSE_DEVICE_TYPE_OPTIONS,
  LICENSE_DEVICE_TYPE_VALUES,
  LICENSE_PLACEHOLDERS,
  LICENSE_DEFAULT_MESSAGE,
  LICENSE_MESSAGE_TIMEOUT_MS,
  LICENSE_FILE_INPUT,
  LICENSE_TOOLTIPS,
  LICENSE_UPLOAD_INSTRUCTION,
  LICENSE_NOTE,
} from "../../../../constants/LicenceConstants";
import { C, OUTLINED_BORDER, OUTLINED_HOVER, OUTLINED_FOCUS, FOCUS_RING_SHADOW } from "../../../../theme/pbxTokens";
import { Btn, ExtensionBreadcrumb } from "../../../../components/common";
import {
  FIELD_RADIUS,
  licencePageWrapStyle,
  licencePageInnerStyle,
  licenceTableContainerStyle,
  licenceHeaderStyle,
  licenceFixedAlertSx,
} from "./LicenceTableHelpers";

const LICENSE_COMPACT_MQ = "(max-width: 768px)";
const LICENSE_FORM_MAX_WIDTH = 720;
const LICENSE_FORM_HORIZONTAL_PADDING = 24;
const LICENSE_FIELD_LABEL_WIDTH = 260;
const LICENSE_CONTROL_COL_WIDTH = 280;
const LICENSE_FIELD_MIDDLE_GAP = 24;
const LICENSE_FIELD_HEIGHT = 32;

const STATUS_BADGE_STYLES = {
  [LICENSE_STATUS.VALID]: { bg: "#dcfce7", border: "#bbf7d0", color: "#166534" },
  [LICENSE_STATUS.INVALID]: { bg: "#fee2e2", border: "#fecaca", color: "#991b1b" },
  [LICENSE_STATUS.EXPIRED]: { bg: "#fef3c7", border: "#fde68a", color: "#b45309" },
  [LICENSE_STATUS.UNKNOWN]: { bg: "#f1f5f9", border: "#e2e8f0", color: "#475569" },
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: C.labelText,
  lineHeight: 1.4,
};

const formBodyStyle = {
  width: "100%",
  maxWidth: LICENSE_FORM_MAX_WIDTH,
  margin: "0 auto",
  padding: `12px ${LICENSE_FORM_HORIZONTAL_PADDING}px 20px`,
  boxSizing: "border-box",
};

const TOOLTIP_PROPS = {
  arrow: true,
  placement: "top",
  slotProps: {
    tooltip: {
      sx: {
        backgroundColor: "#fff",
        color: "#334155",
        border: "1px solid #d1d5db",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: 12,
        lineHeight: 1.45,
        maxWidth: 420,
        padding: "10px 12px",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const controlBaseStyle = (isCompact) => ({
  height: LICENSE_FIELD_HEIGHT,
  width: isCompact ? "100%" : LICENSE_CONTROL_COL_WIDTH,
  minWidth: 0,
  maxWidth: "100%",
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: "#ffffff",
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
});

const readOnlyControlStyle = (isCompact) => ({
  ...controlBaseStyle(isCompact),
  backgroundColor: "#f8fafc",
  textAlign: "center",
  cursor: "default",
  userSelect: "text",
});

const setFieldDefault = (el) => {
  el.style.borderColor = OUTLINED_BORDER;
  el.style.boxShadow = "none";
};

const setFieldHover = (el) => {
  el.style.borderColor = OUTLINED_HOVER;
  el.style.boxShadow = "none";
};

const setFieldFocus = (el) => {
  el.style.borderColor = OUTLINED_FOCUS;
  el.style.boxShadow = FOCUS_RING_SHADOW;
};

const inputInteraction = {
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
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldHover(e.target);
  },
  onMouseLeave: (e) => {
    if (e.target.disabled || e.target.readOnly) return;
    if (document.activeElement === e.target) setFieldFocus(e.target);
    else setFieldDefault(e.target);
  },
};

const formatDisplayDate = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString();
  } catch {
    /* ignore invalid dates */
  }
  return str;
};

const LicenseBreadcrumb = () => (
  <ExtensionBreadcrumb
    root={LICENSE_BREADCRUMB[0]}
    section={LICENSE_BREADCRUMB[1]}
    current={LICENSE_BREADCRUMB[2]}
  />
);

const StatusBadge = ({ status }) => {
  const info =
    LICENSE_STATUS_DISPLAY[status] ||
    LICENSE_STATUS_DISPLAY[LICENSE_STATUS.UNKNOWN];
  const palette =
    STATUS_BADGE_STYLES[status] ||
    STATUS_BADGE_STYLES[LICENSE_STATUS.UNKNOWN];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 72,
        height: 24,
        padding: "0 10px",
        borderRadius: FIELD_RADIUS,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.02em",
        color: palette.color,
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        boxSizing: "border-box",
      }}
    >
      {info.label}
    </span>
  );
};

const LicenseFieldRow = ({
  label,
  tooltip,
  isCompact,
  children,
  alignTop,
  controlJustify = "flex-start",
}) => {
  const stacked = isCompact;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : alignTop ? "flex-start" : "center",
        justifyContent: "flex-start",
        padding: "8px 0",
        gap: stacked ? 8 : LICENSE_FIELD_MIDDLE_GAP,
        width: "100%",
      }}
    >
      <Tooltip title={tooltip || ""} {...TOOLTIP_PROPS}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.labelText,
            textAlign: "left",
            width: stacked ? "100%" : "auto",
            maxWidth: stacked ? "100%" : LICENSE_FIELD_LABEL_WIDTH,
            flexShrink: 0,
            lineHeight: 1.4,
            cursor: tooltip ? "help" : "default",
            paddingTop: alignTop && !stacked ? 6 : 0,
          }}
        >
          {label}
        </span>
      </Tooltip>

      <div
        style={{
          minWidth: 0,
          flexShrink: 0,
          display: "flex",
          alignItems: alignTop ? "flex-start" : "center",
          justifyContent: controlJustify,
          gap: 8,
          width: stacked ? "100%" : LICENSE_CONTROL_COL_WIDTH,
          marginLeft: stacked ? 0 : "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
};

const SectionBlock = ({ title, children, isCompact, headerAction }) => (
  <div
    style={{
      marginTop: 8,
      paddingTop: 16,
      borderTop: `1px solid ${C.divider}`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 12,
      }}
    >
      <div style={sectionTitleStyle}>{title}</div>
      {headerAction}
    </div>
    <div
      style={{
        width: "100%",
        maxWidth: isCompact ? "100%" : LICENSE_FORM_MAX_WIDTH,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  </div>
);

export const LicencePageView = (props) => {
  const isCompact = useMediaQuery("(max-width: 768px)");
  const {
    busy,
    checkValidity,
    deviceTypeMode,
    fetchLicenseInfo,
    fetchSystemFingerprint,
    fileInputRef,
    fileName,
    handleDeviceTypeChange,
    handleFileSelect,
    handleFileUpload,
    licenseData,
    loading,
    message,
    selectedFile,
    setMessage,
    systemFingerprint,
    systemSerial,
  } = props;

  const serialDisplay = (
    systemSerial ||
    licenseData?.Serial_Number ||
    ""
  ).trim();

  return (
    <div
      style={{
        ...licencePageWrapStyle,
        ...(isCompact ? { padding: 8 } : {}),
      }}
      data-native-scroll
    >
      <div style={licencePageInnerStyle}>
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(LICENSE_DEFAULT_MESSAGE)}
            sx={{
              ...licenceFixedAlertSx,
              ...(isCompact
                ? { left: 8, right: 8, top: 12, minWidth: 0, maxWidth: "none" }
                : {}),
            }}
          >
            {message.text}
          </Alert>
        )}

        <LicenseBreadcrumb />

        <div style={licenceTableContainerStyle}>
          <div style={licenceHeaderStyle}>
            <span>{LICENSE_CARD_TITLE}</span>
            <Btn
              variant={LICENSE_BUTTON_VARIANTS.PRIMARY}
              onClick={fetchLicenseInfo}
              disabled={busy}
              style={LICENSE_BUTTON_STYLE}
            >
              {loading.info ? (
                <>
                  <CircularProgress size={14} color="inherit" />
                  {LICENSE_BUTTON_LABELS.REFRESH_INFO}
                </>
              ) : (
                <>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                  {LICENSE_BUTTON_LABELS.REFRESH_INFO}
                </>
              )}
            </Btn>
          </div>

          <div style={formBodyStyle}>
            <LicenseFieldRow
              label={`${LICENSE_FORM_LABELS.Serial_Number}:`}
              tooltip={LICENSE_TOOLTIPS[LICENSE_FORM_LABELS.Serial_Number]}
              isCompact={isCompact}
            >
              <input
                type="text"
                value={serialDisplay}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                onFocus={(e) => e.target.blur()}
                style={readOnlyControlStyle(isCompact)}
              />
            </LicenseFieldRow>

            <LicenseFieldRow
              label={`${LICENSE_FORM_LABELS.STATUS}:`}
              tooltip={LICENSE_TOOLTIPS[LICENSE_FORM_LABELS.STATUS]}
              isCompact={isCompact}
              controlJustify="space-between"
            >
              <StatusBadge status={licenseData.status} />
              <Btn
                variant={LICENSE_BUTTON_VARIANTS.CANCEL}
                onClick={checkValidity}
                disabled={busy}
                style={LICENSE_BUTTON_STYLE}
              >
                {loading.validity ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 16 }} />
                )}
                {LICENSE_BUTTON_LABELS.CHECK_VALIDITY}
              </Btn>
            </LicenseFieldRow>

            <LicenseFieldRow
              label={`${LICENSE_FORM_LABELS.ACTIVATE_DATE}:`}
              tooltip={LICENSE_TOOLTIPS[LICENSE_FORM_LABELS.ACTIVATE_DATE]}
              isCompact={isCompact}
            >
              <input
                type="text"
                value={formatDisplayDate(licenseData.activateDate)}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                onFocus={(e) => e.target.blur()}
                style={readOnlyControlStyle(isCompact)}
                placeholder="—"
              />
            </LicenseFieldRow>

            <LicenseFieldRow
              label={`${LICENSE_FORM_LABELS.EXPIRE_DATE}:`}
              tooltip={LICENSE_TOOLTIPS[LICENSE_FORM_LABELS.EXPIRE_DATE]}
              isCompact={isCompact}
            >
              <input
                type="text"
                value={formatDisplayDate(licenseData.expireDate)}
                readOnly
                tabIndex={-1}
                aria-readonly="true"
                onFocus={(e) => e.target.blur()}
                style={readOnlyControlStyle(isCompact)}
                placeholder="—"
              />
            </LicenseFieldRow>

            <LicenseFieldRow
              label={`${LICENSE_FORM_LABELS.DEVICE_TYPE_MODE}:`}
              tooltip={LICENSE_TOOLTIPS[LICENSE_FORM_LABELS.DEVICE_TYPE_MODE]}
              isCompact={isCompact}
            >
              <select
                value={deviceTypeMode}
                onChange={handleDeviceTypeChange}
                style={{
                  ...controlBaseStyle(isCompact),
                  cursor: "pointer",
                }}
                {...inputInteraction}
              >
                {LICENSE_DEVICE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </LicenseFieldRow>

            <SectionBlock
              title={LICENSE_SECTION_TITLES.SYSTEM_ID}
              isCompact={isCompact}
              headerAction={
                <Btn
                  variant={LICENSE_BUTTON_VARIANTS.PRIMARY}
                  onClick={fetchSystemFingerprint}
                  disabled={busy}
                  style={LICENSE_BUTTON_STYLE}
                >
                  {loading.fingerprint ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                  )}
                  {LICENSE_BUTTON_LABELS.GET_FINGERPRINT}
                </Btn>
              }
            >
              <textarea
                value={systemFingerprint}
                readOnly
                rows={3}
                placeholder={LICENSE_PLACEHOLDERS.SYSTEM_ID}
                tabIndex={-1}
                onFocus={(e) => e.target.blur()}
                style={{
                  width: "100%",
                  minHeight: 88,
                  padding: "10px 12px",
                  fontSize: 12,
                  lineHeight: 1.5,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                  color: C.valueText,
                  backgroundColor: "#f8fafc",
                  border: `1px solid ${C.inputBorder}`,
                  borderRadius: FIELD_RADIUS,
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </SectionBlock>

            <SectionBlock
              title={LICENSE_SECTION_TITLES.UPLOAD}
              isCompact={isCompact}
            >
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: C.valueText,
                }}
              >
                {LICENSE_UPLOAD_INSTRUCTION}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: FIELD_RADIUS,
                  border: `1px dashed ${selectedFile ? C.inputFocus : C.inputBorder}`,
                  backgroundColor: selectedFile ? "#f8fafc" : "#fafbfc",
                  transition: "border-color 0.2s ease, background-color 0.2s ease",
                }}
              >
                <input
                  ref={fileInputRef}
                  accept={LICENSE_FILE_INPUT.ACCEPT}
                  style={{ display: "none" }}
                  id={LICENSE_FILE_INPUT.ID}
                  type="file"
                  onChange={handleFileSelect}
                  disabled={busy}
                />
                <Btn
                  variant={LICENSE_BUTTON_VARIANTS.CANCEL}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  style={LICENSE_CHOOSE_FILE_BUTTON_STYLE}
                >
                  <UploadIcon sx={{ fontSize: 16 }} />
                  {LICENSE_BUTTON_LABELS.SELECT_FILE}
                </Btn>

                <span
                  style={{
                    fontSize: 13,
                    color:
                      fileName === LICENSE_PLACEHOLDERS.NO_FILE
                        ? C.mutedText
                        : C.valueText,
                    flex: 1,
                    minWidth: 140,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {fileName}
                </span>

                {selectedFile && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.mutedText,
                      padding: "2px 8px",
                      borderRadius: FIELD_RADIUS,
                      backgroundColor: "#e2e8f0",
                    }}
                  >
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                )}

                {selectedFile && (
                  <Btn
                    variant={LICENSE_BUTTON_VARIANTS.PRIMARY}
                    onClick={handleFileUpload}
                    disabled={loading.upload || busy}
                    style={LICENSE_BUTTON_STYLE}
                  >
                    {loading.upload ? (
                      <>
                        <CircularProgress size={14} color="inherit" />
                        {LICENSE_BUTTON_LABELS.UPLOADING}
                      </>
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 16 }} />
                        {LICENSE_BUTTON_LABELS.UPLOAD_LICENSE}
                      </>
                    )}
                  </Btn>
                )}
              </div>
            </SectionBlock>

            <div
              style={{
                marginTop: 20,
                padding: "14px 16px",
                borderRadius: FIELD_RADIUS,
                backgroundColor: "#f8fafc",
                border: `1px solid ${C.divider}`,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  ...sectionTitleStyle,
                  fontWeight: 600,
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18, color: C.accent }} />
                {LICENSE_SECTION_TITLES.SUMMARY}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.mutedText, fontWeight: 500 }}>
                  {LICENSE_FORM_LABELS.STATUS}:
                </span>
                <StatusBadge status={licenseData.status} />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 12,
            color: C.accent,
            width: "100%",
            lineHeight: 1.5,
            padding: isCompact ? "0 4px" : 0,
            boxSizing: "border-box",
          }}
        >
          {LICENSE_NOTE}
        </div>
      </div>
    </div>
  );
};
