import React, { useState } from "react";
import {
  RINGING_SCHEME_INITIAL_FORM,
  RINGING_SCHEME_FIELD_TOOLTIPS,
  RINGING_SCHEME_PAGE_BREADCRUMB_ROOT,
  RINGING_SCHEME_PAGE_BREADCRUMB_SECTION,
  RINGING_SCHEME_PAGE_TITLE,
  RINGING_SCHEME_CARD_TITLE,
  RINGING_SCHEME_SAVE_LABEL,
  RINGING_SCHEME_RESET_LABEL,
  RINGING_SCHEME_MATCHING_OPTIONS,
} from "../../../constants/RingingSchemeConstants";
import { Alert, Tooltip } from "@mui/material";

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
  cardBorder: "#d8dde5",
  cardShadow:
    "0 0 14px rgba(0, 0, 0, 0.18), 0 0 5px rgba(0, 0, 0, 0.10)",
  divider: "#e2e6ec",
  labelText: "#3E5475",
  valueText: "#1f2937",
  mutedText: "#6b7280",
  accent: "#3E5475",
  fieldBg: "#ffffff",
  rowAlt: "#f8fafc",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;
const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    primary: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
    },
  };
  const s = styles[variant] || styles.primary;
  const hoverBg =
    variant === "cancel"
      ? "#b6c2d3"
      : "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    variant === "cancel"
      ? "#a3b1c2"
      : "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : "inset 0 2px 4px rgba(15, 23, 42, 0.15)";
  };

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        height: 34,
        lineHeight: "34px",
        boxSizing: "border-box",
        minWidth: 110,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        userSelect: "none",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = baseBg;
        clearPressStyle(e.currentTarget);
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        applyPressStyle(e.currentTarget);
      }}
      onMouseUp={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
        clearPressStyle(e.currentTarget);
      }}
    >
      {children}
    </button>
  );
};

const FOCUS_RING_SHADOW = () => `0 0 0 2px rgba(62, 84, 117, 0.15)`;

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
  el.style.boxShadow = FOCUS_RING_SHADOW();
};

const nativeFieldInteraction = {
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

const MATCHING_SELECT_WIDTH = 240;
const FIELD_CONTROL_HEIGHT = 32;

const nativeSelectStyle = {
  width: "100%",
  minWidth: MATCHING_SELECT_WIDTH,
  maxWidth: MATCHING_SELECT_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  padding: "0 10px",
  fontSize: 13,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  cursor: "pointer",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const nativeInputStyle = {
  width: "100%",
  height: FIELD_CONTROL_HEIGHT,
  padding: "0 10px",
  fontSize: 12,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: 6,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const RS_TH_STYLE = { padding: "8px 14px" };
const RS_TD_STYLE = {
  padding: "6px 14px",
  lineHeight: 1.2,
  verticalAlign: "middle",
};

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const cardTitleBarStyle = {
  width: "100%",
  minHeight: 44,
  padding: "10px 28px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.divider}`,
  boxSizing: "border-box",
  background: C.cardBg,
};

const formBodyStyle = {
  padding: "16px 28px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
  boxSizing: "border-box",
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const footerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const tableShellStyle = {
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  overflow: "hidden",
  background: C.cardBg,
  width: "100%",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
};

const TH = ({ children, align = "left", style: extraStyle }) => (
  <th
    style={{
      background: "#F8FAFC",
      color: C.labelText,
      fontWeight: 700,
      fontSize: 11,
      padding: "8px 14px",
      textAlign: align,
      borderBottom: `1px solid ${C.divider}`,
      borderRight: `1px solid ${C.divider}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      ...extraStyle,
    }}
  >
    {children}
  </th>
);

const RingingSchemeBreadcrumb = () => (
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
    <span>{RINGING_SCHEME_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{RINGING_SCHEME_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {RINGING_SCHEME_PAGE_TITLE}
    </span>
  </div>
);

const MatchingSchemeRow = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      flexWrap: "wrap",
    }}
  >
    <div style={{ minWidth: 160, flexShrink: 0 }}>
      <FxsFieldLabel tooltipKey="ringScheme" tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}>
        Matching Scheme
      </FxsFieldLabel>
    </div>
    <div style={{ flex: "0 0 auto" }}>{children}</div>
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

  const isCallerId = formData.ringScheme === "0";
  const matchColumnLabel = isCallerId ? "CallerID" : "Alert-Info Value";
  const matchColumnTooltip = isCallerId ? "ringCallerId1" : "ringAlertInfo1";

  return (
    <div style={pageWrapStyle}>
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

      <RingingSchemeBreadcrumb />

      <div style={cardStyle}>
        <div style={cardTitleBarStyle}>{RINGING_SCHEME_CARD_TITLE}</div>

        <div style={formBodyStyle}>
          <MatchingSchemeRow>
            <select
              id="ringScheme"
              value={formData.ringScheme}
              onChange={(e) => handleSchemeChange(e.target.value)}
              style={nativeSelectStyle}
              {...nativeFieldInteraction}
            >
              {RINGING_SCHEME_MATCHING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </MatchingSchemeRow>

          <div style={tableShellStyle}>
            <table style={tableStyle}>
              <colgroup>
                <col style={{ width: "14%" }} />
                <col style={{ width: "38%" }} />
                <col style={{ width: "48%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TH style={RS_TH_STYLE}>Scheme</TH>
                  <TH style={RS_TH_STYLE}>
                    <FxsFieldLabel
                      tooltipKey={matchColumnTooltip}
                      tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}
                    >
                      {matchColumnLabel}
                    </FxsFieldLabel>
                  </TH>
                  <TH style={{ ...RS_TH_STYLE, borderRight: "none" }}>
                    <FxsFieldLabel
                      tooltipKey="ringMode1"
                      tooltips={RINGING_SCHEME_FIELD_TOOLTIPS}
                    >
                      Ringing Mode
                    </FxsFieldLabel>
                  </TH>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((n, idx) => {
                  const isLast = idx === 3;
                  const rowBg = idx % 2 === 1 ? C.rowAlt : C.cardBg;
                  const matchField = isCallerId
                    ? `ringCallerId${n}`
                    : `ringAlertInfo${n}`;
                  const matchTooltip = isCallerId
                    ? `ringCallerId${n}`
                    : `ringAlertInfo${n}`;

                  return (
                    <tr key={n} style={{ background: rowBg }}>
                      <td
                        style={{
                          ...RS_TD_STYLE,
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.labelText,
                          borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        Scheme {n}
                      </td>
                      <td
                        style={{
                          ...RS_TD_STYLE,
                          borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                          borderRight: `1px solid ${C.divider}`,
                        }}
                      >
                        <input
                          id={matchField}
                          type="text"
                          value={formData[matchField]}
                          onChange={(e) =>
                            handleInputChange(matchField, e.target.value)
                          }
                          onKeyPress={handleKeyPress1}
                          maxLength={128}
                          style={nativeInputStyle}
                          title={
                            RINGING_SCHEME_FIELD_TOOLTIPS[matchTooltip] || ""
                          }
                          {...nativeFieldInteraction}
                        />
                      </td>
                      <td
                        style={{
                          ...RS_TD_STYLE,
                          borderBottom: isLast ? "none" : `1px solid ${C.divider}`,
                        }}
                      >
                        <input
                          id={`ringMode${n}`}
                          type="text"
                          value={formData[`ringMode${n}`]}
                          onChange={(e) =>
                            handleInputChange(`ringMode${n}`, e.target.value)
                          }
                          onKeyPress={handleKeyPress}
                          maxLength={128}
                          style={nativeInputStyle}
                          title={
                            RINGING_SCHEME_FIELD_TOOLTIPS[`ringMode${n}`] || ""
                          }
                          {...nativeFieldInteraction}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={footerStyle}>
          <Btn
            type="button"
            variant="primary"
            onClick={handleSave}
            style={pageFooterBtnStyle}
          >
            {RINGING_SCHEME_SAVE_LABEL}
          </Btn>
          <Btn
            type="button"
            variant="cancel"
            onClick={handleReset}
            style={pageFooterBtnStyle}
          >
            {RINGING_SCHEME_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default RingingSchemePage;
