import React, { useState } from "react";
import { RINGING_SCHEME_INITIAL_FORM, RINGING_SCHEME_FIELD_TOOLTIPS } from "../../../constants/RingingSchemeConstants";
import {
  Alert,
  TextField,
  Select as MuiSelect,
  MenuItem,
  FormControl,
  Tooltip,
} from "@mui/material";
// ── Local page UI (inlined from fxsSharedUi) ──

const FIELD_LABEL_COLOR = "#3E5475";

const FIELD_TOOLTIP_PROPS = {
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
        textTransform: "none",
        letterSpacing: "normal",
      },
    },
    arrow: { sx: { color: "#fff" } },
  },
};

const formatFieldTooltipTitle = (text) => {
  if (!text) return "";
  const normalized = text.replace(/<br\s*\/?>/gi, "\n").replace(/&quot;/g, '"');
  if (normalized.includes("\n")) {
    return (
      <span style={{ whiteSpace: "pre-line", display: "block" }}>
        {normalized}
      </span>
    );
  }
  return normalized;
};

const FxsFieldLabel = ({ tooltipKey, tooltips, children, style = {} }) => {
  const tooltip = tooltipKey ? tooltips[tooltipKey] || "" : "";
  const labelNode = (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: FIELD_LABEL_COLOR,
        cursor: tooltip ? "help" : undefined,
        ...style,
      }}
    >
      {children}
    </span>
  );
  if (!tooltip) return labelNode;
  return (
    <Tooltip title={formatFieldTooltipTitle(tooltip)} {...FIELD_TOOLTIP_PROPS}>
      {labelNode}
    </Tooltip>
  );
};

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  labelText: "#3E5475",
  valueText: "#0f172a",
  mutedText: "#94a3b8",
  strongText: "#0f172a",
  accent: "#3E5475",
  amber: "#dc2626",
};

const CARD_RADIUS = 10;

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
  form,
  component,
  title,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      textTransform: "none",
      padding: "6px 28px",
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
    danger: {
      background: "#fef2f2",
      color: C.amber,
      border: "0.5px solid #fecaca",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const Component = component || "button";
  return (
    <Component
      type={type}
      form={form}
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 14px",
        borderRadius: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        height: 30,
        gap: 6,
        whiteSpace: "nowrap",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
      }}
    >
      {children}
    </Component>
  );
};


const OUTLINED_BORDER = "rgba(0, 0, 0, 0.23)";
const OUTLINED_HOVER = "rgba(0, 0, 0, 0.87)";
const OUTLINED_FOCUS = "#1976d2";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    "& fieldset": {
      borderColor: OUTLINED_BORDER,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: OUTLINED_HOVER,
    },
    "&.Mui-focused fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
    "&.Mui-focused:hover fieldset": {
      borderColor: OUTLINED_FOCUS,
      borderWidth: 2,
    },
  },
};

const muiSelectInnerSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 36,
    backgroundColor: "#fff",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    padding: "7px 32px 7px 10px !important",
    lineHeight: 1.35,
    boxSizing: "border-box",
  },
};

const muiSelectSx = {
  fontSize: 13,
  backgroundColor: "#fff",
  ...muiSelectInnerSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_BORDER,
    transition: "border-color 0.2s ease",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_HOVER,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: OUTLINED_FOCUS,
    borderWidth: 2,
  },
};


const advancedPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxSizing: "border-box",
};

const advancedPageInnerStyle = {
  width: "100%",
  maxWidth: 1000,
  margin: "0 auto",
};

const advancedTableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: CARD_RADIUS,
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
  overflow: "hidden",
  marginBottom: 24,
};

const advancedBlueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "7px 14px",
  flexWrap: "wrap",
  gap: 12,
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const advancedFormBodyStyle = {
  padding: "12px 20px 0",
};

const advancedFormPanelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  background: C.pageBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: 20,
};

const advancedFormInlineFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "calc(100% + 40px)",
  marginLeft: -20,
  marginRight: -20,
  marginTop: 0,
  marginBottom: 0,
  padding: "10px 20px 10px",
  borderTop: `1px solid ${C.cardBorder}`,
  boxSizing: "border-box",
};

const advancedFormBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  margin: 0,
  padding: "0 28px",
  lineHeight: "34px",
  boxSizing: "border-box",
};

const AdvancedBreadcrumb = ({ current }) => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      fontWeight: 400,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>FXS</span>
    <span>&gt;</span>
    <span>Advanced</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{current}</span>
  </div>
);

const AdvancedPageShell = ({ children, fullWidth = false }) => (
  <div style={advancedPageWrapStyle}>
    <div
      style={{
        ...advancedPageInnerStyle,
        maxWidth: fullWidth ? "100%" : advancedPageInnerStyle.maxWidth,
      }}
    >
      {children}
    </div>
  </div>
);

const wavFileNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: 0,
  lineHeight: 1.45,
  whiteSpace: "normal",
  overflowWrap: "break-word",
  textAlign: "center",
  width: "100%",
};

const FieldRow = ({
  label,
  tooltipKey,
  children,
  required,
  align = "center",
  labelWidth = 170,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      gap: 12,
      minHeight: align === "flex-start" ? undefined : 32,
    }}
  >
    {tooltipKey ? (
      <FxsFieldLabel
        tooltipKey={tooltipKey}
        tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}
        style={{
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </FxsFieldLabel>
    ) : (
      <label
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.labelText,
          width: labelWidth,
          flexShrink: 0,
          textAlign: "left",
          paddingTop: align === "flex-start" ? 8 : 0,
        }}
      >
        {label}
        {required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
    )}
    <div style={{ width: "min(100%, 320px)" }}>{children}</div>
  </div>
);

const AdvancedFormCard = ({
  title,
  children,
  footer,
  fullWidthContent = false,
}) => (
  <div style={advancedTableContainerStyle}>
    <div style={advancedBlueBarStyle}>
      <span>{title}</span>
    </div>
    <div
      style={{
        ...advancedFormBodyStyle,
        paddingBottom: footer ? 0 : 12,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: fullWidthContent ? "100%" : 560,
          width: fullWidthContent ? "100%" : undefined,
          margin: fullWidthContent ? 0 : "0 auto",
        }}
      >
        {children}
      </div>
      {footer ? (
        <div style={advancedFormInlineFooterStyle}>{footer}</div>
      ) : null}
    </div>
  </div>
);

const RINGING_SCHEME_SECTION_HEADING_COLOR = "#30415A";

const RingingSchemeSectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: C.cardBg,
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: RINGING_SCHEME_SECTION_HEADING_COLOR,
      }}
    >
      {title}
    </span>
  </div>
);

const RingingSchemePage = () => {
  const [formData, setFormData] = useState(RINGING_SCHEME_INITIAL_FORM);
  const [changeTime, setChangeTime] = useState(0);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  // --- API / FUNCTIONALITY (UNTOUCHED) ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSchemeChange = (value) => {
    const newData = { ...formData, ringScheme: value };
    if (changeTime > 0) {
      for (let i = 1; i <= 4; i++) {
        const tempMode = newData[`ringMode${i}`];
        newData[`ringMode${i}`] = newData[`ringMode${i}bak`];
        newData[`ringMode${i}bak`] = tempMode;
      }
    } else {
      for (let i = 1; i <= 4; i++) {
        if (value === "0") {
          if (newData[`ringMode${i}`] === "") {
            newData[`ringAlertInfo${i}`] = "";
          } else if (newData[`ringAlertInfo${i}`] === "") {
            newData[`ringMode${i}bak`] = "";
          }
        } else {
          if (newData[`ringMode${i}`] === "") {
            newData[`ringCallerId${i}`] = "";
          } else if (newData[`ringCallerId${i}`] === "") {
            newData[`ringMode${i}bak`] = "";
          }
        }
      }
    }
    setFormData(newData);
    setChangeTime((prev) => prev + 1);
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 48 && key <= 57) || key === 44 || key === 8))
      e.preventDefault();
  };

  const handleKeyPress1 = (e) => {
    const key = e.keyCode || e.which;
    const blocked = [32, 33, 34, 38, 39, 40, 41, 59, 61, 92, 124, 126];
    if (blocked.includes(key) && key !== 8) e.preventDefault();
  };

  const handleSave = () => {
    const minKeepTime = 50;
    const minSendCidLowTime = 1700;
    const CIDstyle = 1;
    const FskPos = 1;

    for (let i = 1; i <= 4; i++) {
      const ringCallerIdObj = formData[`ringCallerId${i}`];
      const ringModeObj = formData[`ringMode${i}`];
      const ringAlertInfoObj = formData[`ringAlertInfo${i}`];
      const ringNumInfo = String(i);

      if (formData.ringScheme === "0") {
        const reg = /^[0-9A-Za-z.*\[\]\-,]{1,128}$/;
        if (ringCallerIdObj !== "") {
          if (!reg.test(ringCallerIdObj)) {
            alert(
              "The CallerID can consist only of 0~9, A~Z, a~z, '.' '[' ']' '-' ',' and '*'!",
            );
            document.getElementById(`ringCallerId${i}`)?.focus();
            return;
          }
          if (ringModeObj === "") {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(",");
            if (strArr[0] === "1") {
              if (strArr.length !== 3) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[2]) < minSendCidLowTime)
              ) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === "2") {
              if (strArr.length !== 5) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                parseInt(strArr[3]) < minKeepTime ||
                parseInt(strArr[4]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[4]) < minSendCidLowTime)
              ) {
                if (
                  parseInt(strArr[1]) < minKeepTime ||
                  parseInt(strArr[2]) < minKeepTime ||
                  parseInt(strArr[3]) < minKeepTime
                ) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(
                `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
              );
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else if (ringModeObj !== "") {
          alert(`Please input the CallerID for Scheme ${ringNumInfo}!`);
          document.getElementById(`ringCallerId${i}`)?.focus();
          return;
        }
      } else {
        if (ringAlertInfoObj !== "") {
          if (ringModeObj === "") {
            alert(`Please input a ringing mode for Scheme ${ringNumInfo}!`);
            document.getElementById(`ringMode${i}`)?.focus();
            return;
          } else {
            const strArr = ringModeObj.split(",");
            if (strArr[0] === "1") {
              if (strArr.length !== 3) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[2]) < minSendCidLowTime)
              ) {
                if (parseInt(strArr[1]) < minKeepTime) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else if (strArr[0] === "2") {
              if (strArr.length !== 5) {
                alert(
                  `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
                );
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
              if (
                parseInt(strArr[1]) < minKeepTime ||
                parseInt(strArr[2]) < minKeepTime ||
                parseInt(strArr[3]) < minKeepTime ||
                parseInt(strArr[4]) < minKeepTime ||
                (CIDstyle === 1 &&
                  FskPos === 1 &&
                  parseInt(strArr[4]) < minSendCidLowTime)
              ) {
                if (
                  parseInt(strArr[1]) < minKeepTime ||
                  parseInt(strArr[2]) < minKeepTime ||
                  parseInt(strArr[3]) < minKeepTime
                ) {
                  alert(
                    `The duration at ON/OFF state for ringing scheme ${ringNumInfo} cannot be less than 50ms!`,
                  );
                } else {
                  alert(
                    `The duration at OFF state for the last ringing scheme ${ringNumInfo} cannot be less than 1700ms!`,
                  );
                }
                document.getElementById(`ringMode${i}`)?.focus();
                return;
              }
            } else {
              alert(
                `Please input a ringing mode in the right format for Scheme ${ringNumInfo}!`,
              );
              document.getElementById(`ringMode${i}`)?.focus();
              return;
            }
          }
        } else if (ringModeObj !== "") {
          alert(`Please input the Alert-Info Value for Scheme ${ringNumInfo}!`);
          document.getElementById(`ringAlertInfo${i}`)?.focus();
          return;
        }
      }
    }

    const ringCallerIdArr = [
      formData.ringCallerId1,
      formData.ringCallerId2,
      formData.ringCallerId3,
      formData.ringCallerId4,
    ];
    const ringAlertInfoArr = [
      formData.ringAlertInfo1,
      formData.ringAlertInfo2,
      formData.ringAlertInfo3,
      formData.ringAlertInfo4,
    ];

    for (let i = 0; i < 3; i++) {
      if (formData.ringScheme === "0") {
        if (ringCallerIdArr[i] === "") continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringCallerIdArr[j] === "") continue;
          if (ringCallerIdArr[i] === ringCallerIdArr[j]) {
            alert("The callerID has already existed!");
            document.getElementById(`ringCallerId${j + 1}`)?.focus();
            return;
          }
        }
      } else {
        if (ringAlertInfoArr[i] === "") continue;
        for (let j = i + 1; j < 4; j++) {
          if (ringAlertInfoArr[j] === "") continue;
          if (ringAlertInfoArr[i] === ringAlertInfoArr[j]) {
            alert("The Alter-Info has already existed!");
            document.getElementById(`ringAlertInfo${j + 1}`)?.focus();
            return;
          }
        }
      }
    }
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(RINGING_SCHEME_INITIAL_FORM);
    setChangeTime(0);
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  const renderSchemeContent = (n) => {
    const isCallerId = formData.ringScheme === "0";
    return (
      <div key={n} style={{ marginBottom: 24 }}>
        <RingingSchemeSectionHeading title={`Scheme ${n}`} />
        <div
          style={{
            ...advancedFormPanelStyle,
            border: "none",
            boxShadow: "none",
            background: "transparent",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "16px 24px",
          }}
        >
          <FieldRow
            label={isCallerId ? "CallerID" : "Alert-Info Value"}
            tooltipKey={isCallerId ? `ringCallerId${n}` : `ringAlertInfo${n}`}
          >
            <TextField
              id={isCallerId ? `ringCallerId${n}` : `ringAlertInfo${n}`}
              size="small"
              fullWidth
              value={
                isCallerId
                  ? formData[`ringCallerId${n}`]
                  : formData[`ringAlertInfo${n}`]
              }
              onChange={(e) =>
                handleInputChange(
                  isCallerId ? `ringCallerId${n}` : `ringAlertInfo${n}`,
                  e.target.value,
                )
              }
              onKeyPress={handleKeyPress1}
              sx={muiTextFieldSx}
              inputProps={{
                maxLength: 128,
                style: { fontSize: 13, padding: "6px 8px" },
              }}
            />
          </FieldRow>
          <FieldRow label="Ringing Mode" tooltipKey={`ringMode${n}`}>
            <TextField
              id={`ringMode${n}`}
              size="small"
              fullWidth
              value={formData[`ringMode${n}`]}
              onChange={(e) =>
                handleInputChange(`ringMode${n}`, e.target.value)
              }
              onKeyPress={handleKeyPress}
              sx={muiTextFieldSx}
              inputProps={{
                maxLength: 128,
                style: { fontSize: 13, padding: "6px 8px" },
              }}
            />
          </FieldRow>
        </div>
      </div>
    );
  };

  return (
    <AdvancedPageShell>
      {toast.msg && (
        <Alert
          severity={toast.type}
          onClose={() => setToast({ msg: "", type: "success" })}
          sx={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            minWidth: 300,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            fontWeight: 500,
          }}
        >
          {toast.msg}
        </Alert>
      )}
      <AdvancedBreadcrumb current="Ringing Scheme" />
      <AdvancedFormCard
        title="Ringing Scheme"
        fullWidthContent
        footer={
          <>
            <Btn
              variant="primary"
              onClick={handleSave}
              style={advancedFormBtnStyle}
            >
              Save
            </Btn>
            <Btn
              variant="cancel"
              onClick={handleReset}
              style={advancedFormBtnStyle}
            >
              Reset
            </Btn>
          </>
        }
      >
          <div>
            <div
              style={{
                ...advancedFormPanelStyle,
                border: "none",
                boxShadow: "none",
                background: "transparent",
                padding: 0,
                marginBottom: 24,
              }}
            >
              <FieldRow label="Matching Scheme" tooltipKey="ringScheme">
                <FormControl size="small" sx={{ width: "100%" }}>
                  <MuiSelect
                    value={formData.ringScheme}
                    onChange={(e) => handleSchemeChange(e.target.value)}
                    sx={muiSelectSx}
                  >
                    <MenuItem value="0" sx={{ fontSize: 13 }}>
                      CallerID Matching
                    </MenuItem>
                    <MenuItem value="1" sx={{ fontSize: 13 }}>
                      Alert-Info Matching
                    </MenuItem>
                  </MuiSelect>
                </FormControl>
              </FieldRow>
            </div>

            {[1, 2, 3, 4].map((n) => renderSchemeContent(n))}
          </div>
      </AdvancedFormCard>
    </AdvancedPageShell>
  );
};

export default RingingSchemePage;
