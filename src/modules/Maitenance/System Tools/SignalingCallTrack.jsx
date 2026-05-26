import React, { useState } from "react";
import {
  SCTRACK_TITLE,
  SCTRACK_RADIO_OPTIONS,
  SCTRACK_LABELS,
  SCTRACK_BUTTONS,
} from "../../../constants/SignalingCallTrackConstants";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

// ── Color palette (same as UserManage) ────────────────────────────────────────
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

// ── Button Component (same as UserManage) ────────────────────────────────────
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
      background: "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
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
        return "linear-gradient(to bottom, #3E5475 0%, #5A6F8F 100%)";
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
        if (!disabled) e.currentTarget.style.background = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.background = baseBg;
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
  justifyContent: "space-between",
  padding: "0 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.strongText,
  borderBottom: `1px solid ${C.divider}`,
};

const inputInteraction = {
  onFocus: (e) => (e.target.style.borderColor = "#0284c7"),
  onBlur: (e) => (e.target.style.borderColor = "#cbd5e1"),
  onMouseEnter: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#64748b";
  },
  onMouseLeave: (e) => {
    if (document.activeElement !== e.target)
      e.target.style.borderColor = "#cbd5e1";
  },
};

const SignalingCallTrack = () => {
  const [filterType, setFilterType] = useState("caller");
  const [filterValue, setFilterValue] = useState("0");
  const [trackMessage, setTrackMessage] = useState("");

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
            Signaling Call Track
          </span>
        </div>

        <div style={tableContainerStyle}>
          <div style={{ ...blueBarStyle, justifyContent: "left" }}>
            <span>{SCTRACK_TITLE}</span>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Filter Row */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 32,
                marginBottom: 24,
                flexWrap: "wrap",
              }}
            >
              <RadioGroup
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                name="filterType"
                row
                style={{ gap: 16 }}
              >
                {SCTRACK_RADIO_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          p: 0.5,
                          color: "#64748b",
                          "&.Mui-checked": { color: C.accent },
                        }}
                      />
                    }
                    label={
                      <span
                        style={{
                          fontSize: 14,
                          color: C.valueText,
                          fontWeight: 500,
                        }}
                      >
                        {opt.label}
                      </span>
                    }
                    sx={{ margin: 0 }}
                  />
                ))}
              </RadioGroup>
              <input
                type="text"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                style={{
                  border: `1px solid ${C.cardBorder}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 14,
                  color: C.valueText,
                  minWidth: 120,
                  maxWidth: 180,
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                {...inputInteraction}
              />
            </div>

            {/* Buttons Row - Justify left as requested */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <Btn
                variant="primary"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.start}
              </Btn>
              <Btn
                variant="cancel"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.stop}
              </Btn>
              <Btn
                variant="cancel"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.filter}
              </Btn>
              <Btn
                variant="cancel"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.clear}
              </Btn>
              <Btn
                variant="cancel"
                style={{ minWidth: 100, height: 34, fontSize: 13 }}
              >
                {SCTRACK_BUTTONS.download}
              </Btn>
            </div>

            {/* Track Message Textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label
                style={{ fontSize: 14, color: C.labelText, fontWeight: 600 }}
              >
                {SCTRACK_LABELS.trackMessage}
              </label>
              <textarea
                value={trackMessage}
                onChange={(e) => setTrackMessage(e.target.value)}
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
                {...inputInteraction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalingCallTrack;
