import React, { useState } from "react";
import { Alert, TextField, Tooltip } from "@mui/material";
import {
  TONE_GENERATOR_INITIAL_FORM,
  TONE_GENERATOR_FIELD_TOOLTIPS,
} from "../../../constants/ToneGeneratorConstants";
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

const checkPara = (value) => {
  const numTest = /^[1234567890]*$/;
  const linepara = value.split(",");
  let highvalue = 0;

  for (let i = 0; i < linepara.length; i++) {
    if (linepara[i] === "") return false;
    const parapart = linepara[i].split("/");
    if (
      parapart.length !== 2 ||
      parapart[0] === "" ||
      parapart[1] === "" ||
      !numTest.test(parapart[1])
    ) {
      return false;
    }
    if (parapart[0] !== "0") highvalue++;
    if (highvalue > 4) return false;

    const paraadd = parapart[0].split("+");
    if (i === 0 && paraadd.length === 1 && paraadd[0] === "0") return false;

    if (paraadd.length === 1) {
      if (
        !numTest.test(paraadd[0]) ||
        (!(parseInt(paraadd[0], 10) >= 200 && parseInt(paraadd[0], 10) <= 3500) &&
          paraadd[0] !== "0")
      ) {
        return false;
      }
    }

    if (paraadd.length === 2) {
      for (let j = 0; j < paraadd.length; j++) {
        if (
          !numTest.test(paraadd[j]) ||
          paraadd[j] === "0" ||
          !(parseInt(paraadd[j], 10) >= 200 && parseInt(paraadd[j], 10) <= 3500)
        ) {
          return false;
        }
      }
    }
    if (paraadd.length > 2) return false;
  }
  return true;
};

const helpBlocks = [
  {
    title: "350+440/0",
    text: "Continuously play a dual tone which is composed of 350HZ and 440HZ.Note: The value range of the frequency is 200~3500HZ.",
  },
  {
    title: "480+620/500,0/500",
    text: "Repeatedly play a dual tone which is composed of 480HZ and 620HZ in the method of 500ms play with 500ms pause. Note: 0/500 denotes 500ms silence and the tone cannot start with the silence.",
  },
  {
    title: "950/333,1400/333,1800/333,0/1000",
    text: "Repeatedly play tones in turn: first a 333ms 950HZ tone, followed by a 333ms 1400HZ tone, then a 333ms 1800HZ tone and at last a 1s silence.Note: The count of signals at ON state in a period cannot be greater than 4.",
  },
];

const labelStyle = {
  fontSize: 14,
  fontWeight: 600,
  color: C.labelText,
  width: 110,
  marginRight: 12,
  flexShrink: 0,
  whiteSpace: "nowrap",
};

const ToneFieldRow = ({ label, id, value, onChange, onKeyPress, tooltipKey }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
    <FxsFieldLabel
      tooltipKey={tooltipKey}
      tooltips={TONE_GENERATOR_FIELD_TOOLTIPS}
      style={{
        width: 110,
        marginRight: 12,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </FxsFieldLabel>
    <TextField
      id={id}
      fullWidth
      size="small"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      variant="outlined"
      sx={{
        ...muiTextFieldSx,
        flex: 1,
        "& .MuiOutlinedInput-root": {
          ...muiTextFieldSx["& .MuiOutlinedInput-root"],
          borderRadius: "6px",
        },
      }}
      inputProps={{
        maxLength: 63,
        style: { fontSize: 14, padding: "6px 10px" },
      }}
    />
  </div>
);

const ToneGeneratorPage = () => {
  const [formData, setFormData] = useState(TONE_GENERATOR_INITIAL_FORM);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const alert = (msg) => {
    const isSuccess = /successfully/i.test(String(msg));
    showToast(msg, isSuccess ? "success" : "error");
  };

  const handleKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (!((key >= 47 && key <= 57) || key === 43 || key === 44 || key === 8)) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    if (!checkPara(formData.dialTone)) {
      alert("Invalid Parameters of Dial Tone Transmitter!");
      document.getElementById("dialTone")?.focus();
      return;
    }
    if (!checkPara(formData.ringbackTone)) {
      alert("Invalid Parameters of Ringback Tone Transmitter!");
      document.getElementById("ringbackTone")?.focus();
      return;
    }
    if (!checkPara(formData.busyTone)) {
      alert("Invalid Parameters of Busy Tone Transmitter!");
      document.getElementById("busyTone")?.focus();
      return;
    }
    alert("Settings saved successfully!");
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
      <AdvancedBreadcrumb current="Tone Generator" />

      <div style={advancedTableContainerStyle}>
        <div style={advancedBlueBarStyle}>
          <span>Tone Generator</span>
        </div>

        <div style={{ padding: "16px 20px 0", background: C.cardBg }}>
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              minHeight: 400,
              width: "100%",
            }}
          >
            {/* Left — tone parameters */}
            <div style={{ width: "45%", paddingTop: 16, paddingRight: 8 }}>
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Dial Tone"
                id="dialTone"
                tooltipKey="dialTone"
                value={formData.dialTone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dialTone: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Ringback Tone"
                id="ringbackTone"
                tooltipKey="ringbackTone"
                value={formData.ringbackTone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ringbackTone: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
              />
              <div style={{ height: 24 }} />
              <ToneFieldRow
                label="Busy Tone"
                id="busyTone"
                tooltipKey="busyTone"
                value={formData.busyTone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, busyTone: e.target.value }))
                }
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Center divider */}
            <div
              style={{
                width: 6,
                flexShrink: 0,
                backgroundColor: "#d1d5db",
                borderRadius: 2,
                margin: "8px 12px",
              }}
              aria-hidden
            />

            {/* Right — format help */}
            <div style={{ width: "54%", paddingTop: 16, paddingLeft: 4 }}>
              <div style={{ marginLeft: "2%", width: "96%" }}>
                {helpBlocks.map((block, idx) => (
                  <div key={block.title}>
                    {idx > 0 && <div style={{ height: 16 }} />}
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.strongText,
                        margin: "0 0 8px",
                      }}
                    >
                      {block.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#64748b",
                        lineHeight: 1.6,
                        margin: "0 0 16px",
                      }}
                    >
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={advancedFormInlineFooterStyle}>
          <Btn
            variant="primary"
            onClick={handleSave}
            style={advancedFormBtnStyle}
          >
            Save
          </Btn>
          <Btn
            variant="cancel"
            onClick={() => setFormData(TONE_GENERATOR_INITIAL_FORM)}
            style={advancedFormBtnStyle}
          >
            Reset
          </Btn>
        </div>
      </div>
    </AdvancedPageShell>
  );
};

export default ToneGeneratorPage;
