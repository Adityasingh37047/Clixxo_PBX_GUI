import React, { useState } from "react";
import { Alert, Tooltip } from "@mui/material";
import {
  TONE_GENERATOR_INITIAL_FORM,
  TONE_GENERATOR_FIELD_TOOLTIPS,
  TONE_GENERATOR_PAGE_BREADCRUMB_ROOT,
  TONE_GENERATOR_PAGE_BREADCRUMB_SECTION,
  TONE_GENERATOR_PAGE_TITLE,
  TONE_GENERATOR_CARD_TITLE,
  TONE_GENERATOR_SAVE_LABEL,
  TONE_GENERATOR_RESET_LABEL,
} from "../../../constants/ToneGeneratorConstants";

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
  fieldBg: "#ffffff",
  helpBg: "#f8fafc",
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

const nativeFieldInteraction = {
  onFocus: (e) => {
    e.target.style.borderColor = OUTLINED_FOCUS;
    e.target.style.boxShadow = FOCUS_RING_SHADOW();
  },
  onBlur: (e) => {
    e.target.style.borderColor = OUTLINED_BORDER;
    e.target.style.boxShadow = "none";
  },
  onMouseEnter: (e) => {
    if (document.activeElement === e.target) {
      e.target.style.borderColor = OUTLINED_FOCUS;
      e.target.style.boxShadow = FOCUS_RING_SHADOW();
    } else {
      e.target.style.borderColor = OUTLINED_HOVER;
    }
  },
  onMouseLeave: (e) => {
    if (document.activeElement === e.target) {
      e.target.style.borderColor = OUTLINED_FOCUS;
      e.target.style.boxShadow = FOCUS_RING_SHADOW();
    } else {
      e.target.style.borderColor = OUTLINED_BORDER;
      e.target.style.boxShadow = "none";
    }
  },
};

const nativeInputStyle = {
  width: "100%",
  height: 36,
  padding: "0 12px",
  fontSize: 13,
  fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  letterSpacing: "0.02em",
  border: `1px solid ${OUTLINED_BORDER}`,
  borderRadius: FIELD_RADIUS,
  outline: "none",
  backgroundColor: C.fieldBg,
  color: C.valueText,
  boxSizing: "border-box",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const pageWrapStyle = {
  backgroundColor: C.pageBg,
  minHeight: "calc(100vh - 80px)",
  width: "100%",
  maxWidth: "100%",
  padding: "8px 28px 16px",
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

const cardBodyStyle = {
  display: "flex",
  alignItems: "stretch",
  width: "100%",
  minHeight: 360,
  padding: "20px 28px",
  gap: 0,
  boxSizing: "border-box",
  flexWrap: "nowrap",
  overflowX: "auto",
};

const columnDividerStyle = {
  width: 1,
  flexShrink: 0,
  alignSelf: "stretch",
  backgroundColor: C.divider,
  margin: "4px 24px",
  minHeight: 280,
};

const formColumnStyle = {
  flex: "1 1 320px",
  minWidth: 280,
  maxWidth: 480,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const helpColumnStyle = {
  flex: "1 1 360px",
  minWidth: 300,
  background: C.helpBg,
  border: `1px solid ${C.divider}`,
  borderRadius: 8,
  padding: "16px 20px",
  boxSizing: "border-box",
};

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "10px 28px",
  borderTop: `1px solid ${C.divider}`,
  background: C.cardBg,
  boxSizing: "border-box",
};

const ToneGeneratorBreadcrumb = () => (
  <div
    style={{
      fontSize: 12,
      color: "#94a3b8",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 4,
      flexWrap: "wrap",
    }}
  >
    <span>{TONE_GENERATOR_PAGE_BREADCRUMB_ROOT}</span>
    <span>&gt;</span>
    <span>{TONE_GENERATOR_PAGE_BREADCRUMB_SECTION}</span>
    <span>&gt;</span>
    <span style={{ color: "#1e293b", fontWeight: 600 }}>
      {TONE_GENERATOR_PAGE_TITLE}
    </span>
  </div>
);

const ToneFieldRow = ({ label, id, value, onChange, onKeyPress, tooltipKey }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <FxsFieldLabel tooltipKey={tooltipKey} tooltips={TONE_GENERATOR_FIELD_TOOLTIPS}>
      {label}
    </FxsFieldLabel>
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      maxLength={63}
      style={nativeInputStyle}
      {...nativeFieldInteraction}
    />
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

  const handleReset = () => setFormData(TONE_GENERATOR_INITIAL_FORM);

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

      <ToneGeneratorBreadcrumb />

      <div style={cardStyle}>
        <div style={cardTitleBarStyle}>{TONE_GENERATOR_CARD_TITLE}</div>

        <div style={cardBodyStyle}>
          <div style={formColumnStyle}>
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

          <div style={columnDividerStyle} aria-hidden />

          <div style={helpColumnStyle}>
            {helpBlocks.map((block, idx) => (
              <div key={block.title} style={{ marginBottom: idx < helpBlocks.length - 1 ? 16 : 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.labelText,
                    margin: "0 0 6px",
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  }}
                >
                  {block.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: C.mutedText,
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {block.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div style={footerStyle}>
          <Btn type="button" variant="primary" onClick={handleSave}>
            {TONE_GENERATOR_SAVE_LABEL}
          </Btn>
          <Btn type="button" variant="cancel" onClick={handleReset}>
            {TONE_GENERATOR_RESET_LABEL}
          </Btn>
        </div>
      </div>
    </div>
  );
};

export default ToneGeneratorPage;
