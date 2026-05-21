import React, { useState } from "react";
import {
  SCT_TITLE,
  SCT_LABELS,
  SCT_TEST_TYPE_OPTIONS,
  SCT_TRUNK_GROUP_OPTIONS,
  SCT_BUTTONS,
  SCT_TRACE_LABEL,
} from "../../../constants/SignalingCallTestConstants";

const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#e2e8f0",
  divider: "#f1f5f9",
  cardShadow: "0 4px 20px rgba(15,23,42,0.06)",
  labelText: "#64748b",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#0284c7",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  type,
}) => {
  const styles = {
    default: {
      background: C.cardBg,
      color: C.valueText,
      border: "1px solid #9ca3af",
    },
    primary: {
      background: C.primary,
      color: C.cardBg,
      border: `1px solid ${C.primary}`,
    },
    cancel: {
      background: "#cbd5e1",
      color: "#374151",
      border: "1px solid #cbd5e1",
      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    },
    edit: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    delete: {
      background: "#fee2e2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    danger: {
      background: C.errorRed,
      color: C.cardBg,
      border: `0.5px solid ${C.errorRed}`,
    },
  };

  const s = styles[variant] || styles.default;
  const hoverBg = (() => {
    switch (variant) {
      case "primary":
        return C.primaryHover;
      case "cancel":
        return "#b6c2d3";
      case "edit":
        return "#bbf7d0";
      case "delete":
        return "#fecaca";
      case "danger":
        return "#b91c1c";
      case "default":
      default:
        return "#e2e8f0";
    }
  })();

  const baseBg = s.background;

  return (
    <button
      type={type}
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
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.backgroundColor = baseBg;
      }}
    >
      {children}
    </button>
  );
};

const tableContainerStyle = {
  width: "100%",
  maxWidth: "100%",
  margin: "0 auto",
  background: C.cardBg,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 20,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  marginLeft: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputStyle = {
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 14,
  color: C.valueText,
  background: C.cardBg,
  width: "100%",
  minWidth: "220px",
  outline: "none",
  transition: "border-color 0.15s ease",
};

const selectStyle = {
  ...inputStyle,
  appearance: "auto",
};

const SignalingCallTest = () => {
  const [testType, setTestType] = useState(SCT_TEST_TYPE_OPTIONS[0].value);
  const [trunkGroup, setTrunkGroup] = useState(
    SCT_TRUNK_GROUP_OPTIONS[0].value,
  );
  const [callerId, setCallerId] = useState("");
  const [calledId, setCalledId] = useState("");
  const [originalCallee, setOriginalCallee] = useState("");
  const [trace, setTrace] = useState("");

  const handleClear = () => {
    setCallerId("");
    setCalledId("");
    setOriginalCallee("");
    setTrace("");
  };

  const inputProps = {
    onFocus: (e) => (e.target.style.borderColor = C.accent),
    onBlur: (e) => (e.target.style.borderColor = C.cardBorder),
    onMouseEnter: (e) => {
      if (document.activeElement !== e.target)
        e.target.style.borderColor = "#94a3b8";
    },
    onMouseLeave: (e) => {
      if (document.activeElement !== e.target)
        e.target.style.borderColor = C.cardBorder;
    },
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
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
          }}
        >
          <span>Maintenance</span>
          <span>&gt;</span>
          <span>System Tool</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Signaling Call Test
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>
            <span>{SCT_TITLE}</span>
          </div>

          <div
            style={{
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <form className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-center mb-8">
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                {SCT_LABELS.testType}
              </label>
              <select
                style={selectStyle}
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                {...inputProps}
              >
                {SCT_TEST_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                {SCT_LABELS.trunkGroup}
              </label>
              <select
                style={selectStyle}
                value={trunkGroup}
                onChange={(e) => setTrunkGroup(e.target.value)}
                {...inputProps}
              >
                {SCT_TRUNK_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                {SCT_LABELS.callerId}
              </label>
              <input
                type="text"
                style={inputStyle}
                value={callerId}
                onChange={(e) => setCallerId(e.target.value)}
                {...inputProps}
              />

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                {SCT_LABELS.calledId}
              </label>
              <input
                type="text"
                style={inputStyle}
                value={calledId}
                onChange={(e) => setCalledId(e.target.value)}
                {...inputProps}
              />

              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.labelText,
                  textAlign: "left",
                }}
              >
                {SCT_LABELS.originalCallee}
              </label>
              <input
                type="text"
                style={inputStyle}
                value={originalCallee}
                onChange={(e) => setOriginalCallee(e.target.value)}
                {...inputProps}
              />
            </form>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Btn
                variant="primary"
                type="button"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCT_BUTTONS.start}
              </Btn>
              <Btn
                variant="cancel"
                type="button"
                onClick={handleClear}
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCT_BUTTONS.clear}
              </Btn>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <label
                style={{
                  fontSize: 14,
                  color: C.labelText,
                  fontWeight: 600,
                  textAlign: "left",
                  marginBottom: 8,
                }}
              >
                {SCT_TRACE_LABEL}
              </label>
              <textarea
                value={trace}
                onChange={(e) => setTrace(e.target.value)}
                style={{
                  width: "100%",
                  minHeight: 220,
                  maxHeight: 400,
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 10,
                  backgroundColor: C.pageBg,
                  color: C.valueText,
                  fontSize: 14,
                  padding: "12px",
                  fontFamily: "monospace",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                {...inputProps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTest;
