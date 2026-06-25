import React, { useState } from "react";
import { DTMF_INITIAL_FORM, DTMF_FIELD_TOOLTIPS } from "../../../constants/DtmfConstants";
import { Alert, Checkbox, TextField, Tooltip } from "@mui/material";
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


const checkboxSx = {
  padding: "4px",
  color: "#64748b",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
  "& .MuiSvgIcon-root": { fontSize: 18 },
};


const FormEnableCheckbox = ({
  checked,
  onChange,
  name,
  label = "Enable",
  id,
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
    }}
  >
    <Checkbox
      id={id || name}
      name={name}
      size="small"
      checked={!!checked}
      onChange={onChange}
      sx={checkboxSx}
    />
    <span style={{ fontSize: 13, color: C.valueText }}>{label}</span>
  </label>
);


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

const dtmfFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  marginTop: 24,
  padding: "10px 20px",
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxSizing: "border-box",
  background: C.cardBg,
  boxShadow: "0 4px 20px rgba(15,23,42,0.06)",
};

const dtmfFooterBtnStyle = {
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

const DtmfPage = () => {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);
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

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), minus sign (45), decimal point (46) if allowed, backspace (8)
    if (
      !(
        (key >= 48 && key <= 57) ||
        key === 45 ||
        (allowDecimal && key === 46) ||
        key === 8
      )
    ) {
      e.preventDefault();
    }
  };

  const handleKeyPressInteger = (e) => {
    const key = e.keyCode || e.which;
    // Allow: numbers (48-57), backspace (8)
    if (!((key >= 48 && key <= 57) || key === 8)) {
      e.preventDefault();
    }
  };

  const checkDtmfEnergy = (value) => {
    const parts = value.toString().split(".");
    if ((parts[1] !== undefined && parts[1].length > 1) || parts.length > 2) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    // Validate DTMF Detector fields
    const positiveTwist = parseFloat(formData.positiveTwist);
    if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
      alert(
        "The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!",
      );
      document.getElementById("positiveTwist")?.focus();
      return;
    }

    const negativeTwist = parseFloat(formData.negativeTwist);
    if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
      alert(
        "The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!",
      );
      document.getElementById("negativeTwist")?.focus();
      return;
    }

    const minDuration = parseFloat(formData.minDuration);
    if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
      alert("The value range of the minimum duration at ON is 10~2000!");
      document.getElementById("minDuration")?.focus();
      return;
    }

    const minNegativeDuration = parseFloat(formData.minNegativeDuration);
    if (
      isNaN(minNegativeDuration) ||
      minNegativeDuration < 10 ||
      minNegativeDuration > 2000
    ) {
      alert("The value range of the minimum duration at OFF is 10~2000!");
      document.getElementById("minNegativeDuration")?.focus();
      return;
    }

    const energyRatio = parseFloat(formData.energyRatio);
    if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
      alert("The ratio range of the DT energy is 1~100!");
      document.getElementById("energyRatio")?.focus();
      return;
    }

    const levelMinIn = parseFloat(formData.levelMinIn);
    if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
      alert("The value range of the lowest energy threshold is -40~-9!");
      document.getElementById("levelMinIn")?.focus();
      return;
    }

    // Validate DTMF Generator fields
    if (formData.dtmfEnergyAdvance) {
      for (let i = 0; i <= 11; i++) {
        const dtmfPlayEnergy = parseFloat(formData[`dtmfPlayEnergy${i}`]);
        if (
          isNaN(dtmfPlayEnergy) ||
          dtmfPlayEnergy < -18 ||
          dtmfPlayEnergy > 11
        ) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value range of DTMF${key} Low Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} Low Energy only have one decimal!`);
          document.getElementById(`dtmfPlayEnergy${i}`)?.focus();
          return;
        }

        const dtmfHighPlayEnergy = parseFloat(
          formData[`dtmfHighPlayEnergy${i}`],
        );
        if (
          isNaN(dtmfHighPlayEnergy) ||
          dtmfHighPlayEnergy < -18 ||
          dtmfHighPlayEnergy > 11
        ) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value range of DTMF${key} High Energy is -18.0~11.0dB!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} High Energy only have one decimal!`);
          document.getElementById(`dtmfHighPlayEnergy${i}`)?.focus();
          return;
        }
      }
    } else {
      const dtmfPlayEnergy = parseFloat(formData.dtmfPlayEnergy);
      if (
        isNaN(dtmfPlayEnergy) ||
        dtmfPlayEnergy < -18 ||
        dtmfPlayEnergy > 11
      ) {
        alert("The value range of 'DTMF Energy' is -18~11dB!");
        document.getElementById("dtmfPlayEnergy")?.focus();
        return;
      }
    }

    const dtmfTxHighDuration = parseFloat(formData.dtmfTxHighDuration);
    if (
      isNaN(dtmfTxHighDuration) ||
      dtmfTxHighDuration < 0 ||
      dtmfTxHighDuration > 16383
    ) {
      alert("The value range of 'Duration at ON' is 0~16383!");
      document.getElementById("dtmfTxHighDuration")?.focus();
      return;
    }

    const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
    if (
      isNaN(dtmfTxLowDuration) ||
      dtmfTxLowDuration < 0 ||
      dtmfTxLowDuration > 16383
    ) {
      alert("The value range of 'Duration at OFF' is 0~16383!");
      document.getElementById("dtmfTxLowDuration")?.focus();
      return;
    }

    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(DTMF_INITIAL_FORM);
  };

  const labelCellStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: C.labelText,
    paddingRight: 24,
    textAlign: "left",
    verticalAlign: "middle",
  };
  const inputCellStyle = {
    width: "35%",
    padding: 0,
    verticalAlign: "middle",
  };

  const renderField = (
    label,
    fieldName,
    type = "text",
    allowDecimal = false,
    width = "200px",
  ) => {
    return (
      <>
        <tr style={{ height: "22px" }}>
          <td style={labelCellStyle}>
            <FxsFieldLabel tooltipKey={fieldName} tooltips={DTMF_FIELD_TOOLTIPS}>
              {label}
            </FxsFieldLabel>
          </td>
          <td style={inputCellStyle}>
            {type === "checkbox" ? (
              <FormEnableCheckbox
                checked={!!formData[fieldName]}
                onChange={() => handleCheckboxChange(fieldName)}
              />
            ) : (
              <TextField
                id={fieldName}
                value={formData[fieldName]}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                onKeyPress={(e) =>
                  allowDecimal
                    ? handleKeyPress(e, true)
                    : handleKeyPressInteger(e)
                }
                inputProps={{
                  maxLength: 20,
                  style: { fontSize: 14, padding: "4px 8px" },
                }}
                sx={{
                  width: width,
                  ...muiTextFieldSx,
                  "& .MuiOutlinedInput-root": {
                    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
                    height: "28px",
                  },
                }}
                variant="outlined"
                size="small"
              />
            )}
          </td>
        </tr>
        <tr>
          <td colSpan={2} style={{ height: "8px" }}></td>
        </tr>
      </>
    );
  };

  const renderAdvancedEnergyField = (label, lowField, highField, index) => {
    const highLabel = label.replace("Low Hz", "High Hz");
    return (
      <>
        {renderField(label, lowField, "text", true)}
        {renderField(highLabel, highField, "text", true)}
      </>
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
      <AdvancedBreadcrumb current="DTMF" />
      <AdvancedFormCard title="DTMF Detector">
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "65%" }} />
            <col style={{ width: "35%" }} />
          </colgroup>
          <tbody>
            {renderField(
              "Energy Difference of High-freq minus Low-freq (dB)",
              "positiveTwist",
              "text",
              false,
            )}
            {renderField(
              "Energy Difference of Low-freq minus High-freq (dB)",
              "negativeTwist",
              "text",
              false,
            )}
            {renderField(
              "Minimum Duration at ON (ms)",
              "minDuration",
              "text",
              false,
            )}
            {renderField(
              "Minimum Duration at OFF (ms)",
              "minNegativeDuration",
              "text",
              false,
            )}
            {renderField("Ratio of DT Energy(%)", "energyRatio", "text", true)}
            {renderField(
              "Lowest Energy Threshold (dB)",
              "levelMinIn",
              "text",
              false,
            )}
            {renderField(
              "DTMF Display via Channel Status",
              "enableDisplayDtmf",
              "checkbox",
            )}
            {renderField("ABCD Detection", "enableOmitABCD", "checkbox")}
          </tbody>
        </table>
      </AdvancedFormCard>

      <div style={{ marginTop: 16, width: "100%" }}>
        <AdvancedFormCard title="DTMF Generator">
          <table style={{ width: "100%", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "65%" }} />
              <col style={{ width: "35%" }} />
            </colgroup>
            <tbody>
              <tr style={{ height: "22px" }}>
                <td style={labelCellStyle}>
                  <FxsFieldLabel
                    tooltipKey="dtmfEnergyAdvance"
                    tooltips={DTMF_FIELD_TOOLTIPS}
                  >
                    DTMF Energy Advance Set
                  </FxsFieldLabel>
                </td>
                <td style={inputCellStyle}>
                  <FormEnableCheckbox
                    checked={!!formData.dtmfEnergyAdvance}
                    onChange={() => handleCheckboxChange("dtmfEnergyAdvance")}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ height: "8px" }}></td>
              </tr>

              {/* Normal DTMF Energy (shown when advance is off) */}
              {!formData.dtmfEnergyAdvance &&
                renderField(
                  "DTMF Energy (dB)",
                  "dtmfPlayEnergy",
                  "text",
                  false,
                )}

              {/* Advanced Energy Settings (shown when advance is on) */}
              {formData.dtmfEnergyAdvance && (
                <>
                  {renderAdvancedEnergyField(
                    "DTMF0 Low Hz Energy (dB)",
                    "dtmfPlayEnergy0",
                    "dtmfHighPlayEnergy0",
                    0,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF1 Low Hz Energy (dB)",
                    "dtmfPlayEnergy1",
                    "dtmfHighPlayEnergy1",
                    1,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF2 Low Hz Energy (dB)",
                    "dtmfPlayEnergy2",
                    "dtmfHighPlayEnergy2",
                    2,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF3 Low Hz Energy (dB)",
                    "dtmfPlayEnergy3",
                    "dtmfHighPlayEnergy3",
                    3,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF4 Low Hz Energy (dB)",
                    "dtmfPlayEnergy4",
                    "dtmfHighPlayEnergy4",
                    4,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF5 Low Hz Energy (dB)",
                    "dtmfPlayEnergy5",
                    "dtmfHighPlayEnergy5",
                    5,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF6 Low Hz Energy (dB)",
                    "dtmfPlayEnergy6",
                    "dtmfHighPlayEnergy6",
                    6,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF7 Low Hz Energy (dB)",
                    "dtmfPlayEnergy7",
                    "dtmfHighPlayEnergy7",
                    7,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF8 Low Hz Energy (dB)",
                    "dtmfPlayEnergy8",
                    "dtmfHighPlayEnergy8",
                    8,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF9 Low Hz Energy (dB)",
                    "dtmfPlayEnergy9",
                    "dtmfHighPlayEnergy9",
                    9,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF* Low Hz Energy (dB)",
                    "dtmfPlayEnergy10",
                    "dtmfHighPlayEnergy10",
                    10,
                  )}
                  {renderAdvancedEnergyField(
                    "DTMF# Low Hz Energy (dB)",
                    "dtmfPlayEnergy11",
                    "dtmfHighPlayEnergy11",
                    11,
                  )}
                </>
              )}

              {renderField(
                "Duration at ON (ms)",
                "dtmfTxHighDuration",
                "text",
                false,
              )}
              {renderField(
                "Duration at OFF (ms)",
                "dtmfTxLowDuration",
                "text",
                false,
              )}
            </tbody>
          </table>

          {/* Warning Note */}
          <div
            style={{
              marginTop: "16px",
              marginLeft: "auto",
              marginRight: "auto",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                color: "#dc2626",
                fontSize: "13px",
                margin: 0,
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Note: Setting the DTMF transmission energy too large may cause the
              distortion of the transmitted DTMF. Please configure it carefully.
            </p>
          </div>
        </AdvancedFormCard>
      </div>

      <div style={dtmfFooterStyle}>
        <Btn
          variant="primary"
          type="button"
          onClick={handleSave}
          style={dtmfFooterBtnStyle}
        >
          Save
        </Btn>
        <Btn
          variant="cancel"
          type="button"
          onClick={handleReset}
          style={dtmfFooterBtnStyle}
        >
          Reset
        </Btn>
      </div>
    </AdvancedPageShell>
  );
};

export default DtmfPage;
