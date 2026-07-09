import React, { useState } from "react";
import {
  DTMF_INITIAL_FORM,
  DTMF_FIELD_TOOLTIPS,
  DTMF_PAGE_BREADCRUMB_ROOT,
  DTMF_PAGE_BREADCRUMB_SECTION,
  DTMF_PAGE_TITLE,
  DTMF_DETECTOR_TAB,
  DTMF_GENERATOR_TAB,
  DTMF_TAB_DETECTOR,
  DTMF_TAB_GENERATOR,
  DTMF_SAVE_LABEL,
  DTMF_RESET_LABEL,
  DTMF_GENERATOR_WARNING,
} from "../../../constants/DtmfConstants";
import { Alert, Checkbox, Tooltip } from "@mui/material";

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
  strongText: "#1f2937",
  accent: "#3E5475",
  amber: "#dc2626",
  fieldBg: "#ffffff",
};

const CARD_RADIUS = 10;
const FIELD_RADIUS = 8;

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
    tabActive: {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
    },
    tabInactive: {
      background: C.cardBg,
      color: C.labelText,
      border: `1px solid ${C.cardBorder}`,
      fontWeight: 600,
    },
  };
  const s = styles[variant] || styles.default;
  const hoverBg =
    {
      primary: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      cancel: "#b6c2d3",
      danger: "#fca5a5",
      outline: "#e2e8f0",
      tabActive: "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)",
      tabInactive: "#e2e8f0",
      default: "#e2e8f0",
    }[variant] || "#e2e8f0";
  const baseBg = extraStyle?.background ?? s.background;
  const baseShadow = extraStyle?.boxShadow ?? s.boxShadow ?? "none";
  const activeBg =
    {
      primary: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      cancel: "#a3b1c2",
      danger: "#f87171",
      outline: "#d1d9e6",
      tabActive: "linear-gradient(to bottom, #2C3E57 0%, #3E5475 100%)",
      tabInactive: "#d1d9e6",
      default: "#d1d5db",
    }[variant] || "#d1d5db";

  const clearPressStyle = (el) => {
    el.style.transform = "";
    el.style.boxShadow = baseShadow;
  };

  const applyPressStyle = (el) => {
    el.style.background = activeBg;
    el.style.transform = "translateY(1px) scale(0.98)";
    el.style.boxShadow =
      variant === "primary" || variant === "tabActive"
        ? "inset 0 2px 4px rgba(0, 0, 0, 0.25)"
        : variant === "cancel"
          ? "inset 0 2px 4px rgba(15, 23, 42, 0.15)"
          : "inset 0 1px 3px rgba(15, 23, 42, 0.12)";
  };

  const Component = component || "button";
  const isFooterBtn = variant === "primary" || variant === "cancel";

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
        padding: isFooterBtn ? "0 28px" : "6px 14px",
        borderRadius: 8,
        fontSize: isFooterBtn ? 13 : 12,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition:
          "background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease",
        height: isFooterBtn ? 34 : 30,
        gap: 6,
        whiteSpace: "nowrap",
        userSelect: "none",
        lineHeight: isFooterBtn ? "34px" : undefined,
        boxSizing: "border-box",
        ...s,
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background = hoverBg;
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
    </Component>
  );
};

const OUTLINED_BORDER = "#d1d5db";
const OUTLINED_HOVER = "#9ca3af";
const OUTLINED_FOCUS = "#3E5475";

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

const FIELD_CONTROL_WIDTH = 220;
const FIELD_CONTROL_HEIGHT = 36;

const nativeFieldInputStyle = {
  width: "100%",
  minWidth: 0,
  maxWidth: FIELD_CONTROL_WIDTH,
  height: FIELD_CONTROL_HEIGHT,
  minHeight: FIELD_CONTROL_HEIGHT,
  padding: "0 12px",
  fontSize: 13,
  lineHeight: `${FIELD_CONTROL_HEIGHT - 2}px`,
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  boxShadow: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const checkboxSx = {
  padding: "1px",
  color: "#3E5475",
  "&.Mui-checked": { color: "#0284c7" },
  "&.MuiCheckbox-indeterminate": { color: "#0284c7" },
};

const dtmfPageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  boxSizing: "border-box",
};

const dtmfPageInnerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
};

const dtmfCardStyle = {
  width: "100%",
  background: C.cardBg,
  borderRadius: CARD_RADIUS,
  overflow: "hidden",
  border: `1px solid ${C.cardBorder}`,
  boxShadow: C.cardShadow,
  display: "flex",
  flexDirection: "column",
};

const dtmfHeaderStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  padding: "7px 14px",
  borderBottom: `1px solid ${C.divider}`,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  flexWrap: "wrap",
  gap: 8,
  boxSizing: "border-box",
  flexShrink: 0,
};

const dtmfHeaderLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexWrap: "wrap",
  minWidth: 0,
};

const dtmfFormBodyStyle = {
  padding: "20px 28px 8px",
  display: "flex",
  flexDirection: "column",
  gap: 0,
  maxWidth: 760,
  width: "100%",
  margin: "0 auto",
  boxSizing: "border-box",
};

const pageFooterBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const dtmfFormFooterStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  width: "100%",
  margin: 0,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
  flexShrink: 0,
  borderBottomLeftRadius: CARD_RADIUS,
  borderBottomRightRadius: CARD_RADIUS,
};

const dtmfFormBtnStyle = {
  height: 30,
  padding: "6px 14px",
  fontSize: 12,
  borderRadius: 10,
  minWidth: 100,
};

const dtmfNoteStyle = {
  fontSize: 12,
  color: C.mutedText,
  margin: "12px 0 0",
  lineHeight: 1.45,
  whiteSpace: "nowrap",
  textAlign: "center",
  width: "100%",
};

const DtmfBreadcrumb = () => (
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
    <span>{DTMF_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{DTMF_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>{DTMF_PAGE_TITLE}</span>
  </div>
);

const DtmfFieldRow = ({ label, tooltipKey, children, isLongLabel = false }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      width: "100%",
      minHeight: 36,
      alignItems: isLongLabel ? "flex-start" : "center",
      paddingTop: isLongLabel ? 8 : 0,
      paddingBottom: isLongLabel ? 8 : 0,
      marginBottom: 10,
    }}
  >
    <div
      style={{
        flex: "1 1 auto",
        minWidth: 0,
        paddingRight: 24,
        textAlign: "left",
        lineHeight: 1.45,
      }}
    >
      <FxsFieldLabel tooltipKey={tooltipKey} tooltips={DTMF_FIELD_TOOLTIPS}>
        {label}
      </FxsFieldLabel>
    </div>
    <div
      style={{
        flex: "0 0 auto",
        width: FIELD_CONTROL_WIDTH,
        maxWidth: "100%",
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </div>
  </div>
);

const GENERATOR_FIELD_KEYS = new Set([
  "dtmfEnergyAdvance",
  "dtmfPlayEnergy",
  "dtmfTxHighDuration",
  "dtmfTxLowDuration",
  ...Array.from({ length: 12 }, (_, i) => `dtmfPlayEnergy${i}`),
  ...Array.from({ length: 12 }, (_, i) => `dtmfHighPlayEnergy${i}`),
]);

const DtmfPage = () => {
  const [formData, setFormData] = useState(DTMF_INITIAL_FORM);
  const [activeTab, setActiveTab] = useState(DTMF_TAB_DETECTOR);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const focusField = (fieldName) => {
    const tab = GENERATOR_FIELD_KEYS.has(fieldName)
      ? DTMF_TAB_GENERATOR
      : DTMF_TAB_DETECTOR;
    setActiveTab(tab);
    requestAnimationFrame(() => {
      document.getElementById(fieldName)?.focus();
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleKeyPress = (e, allowDecimal = false) => {
    const key = e.keyCode || e.which;
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
    const positiveTwist = parseFloat(formData.positiveTwist);
    if (isNaN(positiveTwist) || positiveTwist < 0 || positiveTwist > 24) {
      alert(
        "The range of 'Energy Difference for High-freq minus Low-freq' is 0~24!",
      );
      focusField("positiveTwist");
      return;
    }

    const negativeTwist = parseFloat(formData.negativeTwist);
    if (isNaN(negativeTwist) || negativeTwist < 0 || negativeTwist > 24) {
      alert(
        "The range of 'Energy Difference for Low-freq minus High-freq' is 0~24!",
      );
      focusField("negativeTwist");
      return;
    }

    const minDuration = parseFloat(formData.minDuration);
    if (isNaN(minDuration) || minDuration < 10 || minDuration > 2000) {
      alert("The value range of the minimum duration at ON is 10~2000!");
      focusField("minDuration");
      return;
    }

    const minNegativeDuration = parseFloat(formData.minNegativeDuration);
    if (
      isNaN(minNegativeDuration) ||
      minNegativeDuration < 10 ||
      minNegativeDuration > 2000
    ) {
      alert("The value range of the minimum duration at OFF is 10~2000!");
      focusField("minNegativeDuration");
      return;
    }

    const energyRatio = parseFloat(formData.energyRatio);
    if (isNaN(energyRatio) || energyRatio < 1 || energyRatio > 100) {
      alert("The ratio range of the DT energy is 1~100!");
      focusField("energyRatio");
      return;
    }

    const levelMinIn = parseFloat(formData.levelMinIn);
    if (isNaN(levelMinIn) || levelMinIn < -40 || levelMinIn > -9) {
      alert("The value range of the lowest energy threshold is -40~-9!");
      focusField("levelMinIn");
      return;
    }

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
          focusField(`dtmfPlayEnergy${i}`);
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} Low Energy only have one decimal!`);
          focusField(`dtmfPlayEnergy${i}`);
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
          focusField(`dtmfHighPlayEnergy${i}`);
          return;
        }
        if (checkDtmfEnergy(formData[`dtmfHighPlayEnergy${i}`])) {
          const key = i === 10 ? "*" : i === 11 ? "#" : i;
          alert(`The value of DTMF${key} High Energy only have one decimal!`);
          focusField(`dtmfHighPlayEnergy${i}`);
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
        focusField("dtmfPlayEnergy");
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
      focusField("dtmfTxHighDuration");
      return;
    }

    const dtmfTxLowDuration = parseFloat(formData.dtmfTxLowDuration);
    if (
      isNaN(dtmfTxLowDuration) ||
      dtmfTxLowDuration < 0 ||
      dtmfTxLowDuration > 16383
    ) {
      alert("The value range of 'Duration at OFF' is 0~16383!");
      focusField("dtmfTxLowDuration");
      return;
    }

    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    setFormData(DTMF_INITIAL_FORM);
    setActiveTab(DTMF_TAB_DETECTOR);
  };

  const renderTextField = (label, fieldName, allowDecimal = false) => (
    <DtmfFieldRow
      key={fieldName}
      label={label}
      tooltipKey={fieldName}
      isLongLabel={label.length > 42}
    >
      <input
        id={fieldName}
        type="text"
        value={formData[fieldName]}
        onChange={(e) => handleInputChange(fieldName, e.target.value)}
        onKeyPress={(e) =>
          allowDecimal ? handleKeyPress(e, true) : handleKeyPressInteger(e)
        }
        style={nativeFieldInputStyle}
        maxLength={20}
        {...nativeFieldInteraction}
      />
    </DtmfFieldRow>
  );

  const renderCheckboxField = (label, fieldName) => (
    <DtmfFieldRow key={fieldName} label={label} tooltipKey={fieldName}>
      <Checkbox
        id={fieldName}
        name={fieldName}
        size="small"
        checked={!!formData[fieldName]}
        onChange={() => handleCheckboxChange(fieldName)}
        sx={checkboxSx}
      />
    </DtmfFieldRow>
  );

  const renderAdvancedEnergyField = (label, lowField, highField) => (
    <React.Fragment key={lowField}>
      {renderTextField(label, lowField, true)}
      {renderTextField(label.replace("Low Hz", "High Hz"), highField, true)}
    </React.Fragment>
  );

  const renderDetectorSection = () => (
    <>
      {renderTextField(
        "Energy Difference of High-freq minus Low-freq (dB)",
        "positiveTwist",
      )}
      {renderTextField(
        "Energy Difference of Low-freq minus High-freq (dB)",
        "negativeTwist",
      )}
      {renderTextField("Minimum Duration at ON (ms)", "minDuration")}
      {renderTextField("Minimum Duration at OFF (ms)", "minNegativeDuration")}
      {renderTextField("Ratio of DT Energy(%)", "energyRatio", true)}
      {renderTextField("Lowest Energy Threshold (dB)", "levelMinIn")}
      {renderCheckboxField(
        "DTMF Display via Channel Status",
        "enableDisplayDtmf",
      )}
      {renderCheckboxField("ABCD Detection", "enableOmitABCD")}
    </>
  );

  const renderGeneratorSection = () => (
    <>
      {renderCheckboxField("DTMF Energy Advance Set", "dtmfEnergyAdvance")}

      {!formData.dtmfEnergyAdvance &&
        renderTextField("DTMF Energy (dB)", "dtmfPlayEnergy")}

      {formData.dtmfEnergyAdvance && (
        <>
          {renderAdvancedEnergyField(
            "DTMF0 Low Hz Energy (dB)",
            "dtmfPlayEnergy0",
            "dtmfHighPlayEnergy0",
          )}
          {renderAdvancedEnergyField(
            "DTMF1 Low Hz Energy (dB)",
            "dtmfPlayEnergy1",
            "dtmfHighPlayEnergy1",
          )}
          {renderAdvancedEnergyField(
            "DTMF2 Low Hz Energy (dB)",
            "dtmfPlayEnergy2",
            "dtmfHighPlayEnergy2",
          )}
          {renderAdvancedEnergyField(
            "DTMF3 Low Hz Energy (dB)",
            "dtmfPlayEnergy3",
            "dtmfHighPlayEnergy3",
          )}
          {renderAdvancedEnergyField(
            "DTMF4 Low Hz Energy (dB)",
            "dtmfPlayEnergy4",
            "dtmfHighPlayEnergy4",
          )}
          {renderAdvancedEnergyField(
            "DTMF5 Low Hz Energy (dB)",
            "dtmfPlayEnergy5",
            "dtmfHighPlayEnergy5",
          )}
          {renderAdvancedEnergyField(
            "DTMF6 Low Hz Energy (dB)",
            "dtmfPlayEnergy6",
            "dtmfHighPlayEnergy6",
          )}
          {renderAdvancedEnergyField(
            "DTMF7 Low Hz Energy (dB)",
            "dtmfPlayEnergy7",
            "dtmfHighPlayEnergy7",
          )}
          {renderAdvancedEnergyField(
            "DTMF8 Low Hz Energy (dB)",
            "dtmfPlayEnergy8",
            "dtmfHighPlayEnergy8",
          )}
          {renderAdvancedEnergyField(
            "DTMF9 Low Hz Energy (dB)",
            "dtmfPlayEnergy9",
            "dtmfHighPlayEnergy9",
          )}
          {renderAdvancedEnergyField(
            "DTMF* Low Hz Energy (dB)",
            "dtmfPlayEnergy10",
            "dtmfHighPlayEnergy10",
          )}
          {renderAdvancedEnergyField(
            "DTMF# Low Hz Energy (dB)",
            "dtmfPlayEnergy11",
            "dtmfHighPlayEnergy11",
          )}
        </>
      )}

      {renderTextField("Duration at ON (ms)", "dtmfTxHighDuration")}
      {renderTextField("Duration at OFF (ms)", "dtmfTxLowDuration")}

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 4,
        }}
      >
        <p style={dtmfNoteStyle}>{DTMF_GENERATOR_WARNING}</p>
      </div>
    </>
  );

  return (
    <div style={dtmfPageWrapStyle} data-native-scroll>
      <div style={dtmfPageInnerStyle}>
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

        <DtmfBreadcrumb />

        <div style={dtmfCardStyle}>
          <div style={dtmfHeaderStyle}>
            <div style={dtmfHeaderLeftStyle}>
              <Btn
                type="button"
                variant={
                  activeTab === DTMF_TAB_DETECTOR ? "tabActive" : "tabInactive"
                }
                onClick={() => setActiveTab(DTMF_TAB_DETECTOR)}
                style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
              >
                {DTMF_DETECTOR_TAB}
              </Btn>
              <Btn
                type="button"
                variant={
                  activeTab === DTMF_TAB_GENERATOR
                    ? "tabActive"
                    : "tabInactive"
                }
                onClick={() => setActiveTab(DTMF_TAB_GENERATOR)}
                style={{ height: 30, padding: "6px 14px", fontSize: 12, borderRadius: 10 }}
              >
                {DTMF_GENERATOR_TAB}
              </Btn>
            </div>
          </div>

          <div style={dtmfFormBodyStyle}>
            {activeTab === DTMF_TAB_DETECTOR
              ? renderDetectorSection()
              : renderGeneratorSection()}
          </div>

          <div style={dtmfFormFooterStyle}>
            <Btn
              type="button"
              variant="primary"
              onClick={handleSave}
              style={dtmfFormBtnStyle}
            >
              {DTMF_SAVE_LABEL}
            </Btn>
            <Btn
              type="button"
              variant="cancel"
              onClick={handleReset}
              style={dtmfFormBtnStyle}
            >
              {DTMF_RESET_LABEL}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DtmfPage;
