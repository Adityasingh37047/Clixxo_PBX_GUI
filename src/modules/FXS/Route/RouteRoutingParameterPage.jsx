import React, { useState } from "react";
import {
  ROUTE_MODE_OPTIONS,
  ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
} from "../../../sections/route/constants/RouteRoutingParameterPageConstants";
import { Select as MuiSelect, MenuItem, FormControl } from "@mui/material";

// ── Color Palette (From Source) ───────────────────────────────────────────────
const C = {
  pageBg: "#eef2f7",
  cardBg: "#ffffff",
  cardBorder: "#9ca3af",
  labelText: "#1e293b",
  valueText: "#1e293b",
  mutedText: "#94a3b8",
  accent: "#1e293b",
  errorRed: "#dc2626",
};

// ── Shared UI Components (From Source) ────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  disabled,
  variant = "default",
  style: extraStyle,
  title,
  type = "button",
}) => {
  const variants = {
    default: {
      background: "#1e293b",
      color: "#fff",
      border: "1px solid #9ca3af",
    },
    outline: {
      background: C.cardBg,
      color: C.labelText,
      border: `0.5px solid ${C.cardBorder}`,
    },
    danger: {
      background: "#fef2f2",
      color: C.errorRed,
      border: `0.5px solid #fecaca`,
    },
    accent: {
      background: C.cardBg,
      color: C.accent,
      border: `0.5px solid ${C.cardBorder}`,
    },
  };
  const s = variants[variant] || variants.default;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        ...s,
        fontSize: 11,
        fontWeight: 600,
        padding: "5px 14px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        transition: "opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "0.82";
      }}
      onMouseLeave={(e) => {
        if (!disabled) e.currentTarget.style.opacity = "1";
      }}
    >
      {children}
    </button>
  );
};

const FieldRow = ({ label, children, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, ...style }}>
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: C.labelText,
        width: 220,
        flexShrink: 0,
      }}
    >
      {label}
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const SectionHeading = ({ title }) => (
  <div style={{ margin: "16px 0 24px 0", position: "relative" }}>
    <div style={{ borderTop: `1px solid ${C.cardBorder}` }} />
    <span
      style={{
        position: "absolute",
        top: -10,
        left: 0,
        background: "#fff",
        paddingRight: 8,
        fontSize: 13,
        fontWeight: 600,
        color: C.mutedText,
      }}
    >
      {title}
    </span>
  </div>
);

const inputStyle = {
  height: 32,
  padding: "0 8px",
  fontSize: 13,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 4,
  outline: "none",
  backgroundColor: "#fff",
  color: C.valueText,
  boxSizing: "border-box",
  width: "100%",
};

// ── Main Component ────────────────────────────────────────────────────────────
const RouteRoutingParameterPage = () => {
  const [formData, setFormData] = useState(
    ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
  );

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Number input validation: allows only numbers
  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
      // Allow numbers
    } else if (key !== 8) {
      // Allow backspace (8)
      e.preventDefault();
    }
  };

  const handleSave = () => {
    // Form validation can be added here if needed
    alert("Settings saved successfully!");
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: C.mutedText }}>
            FXS &rsaquo; Route &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Routing Parameters
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: C.cardBg,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ padding: "24px 28px" }}>
            <SectionHeading title="Routing Parameters" />

            <div style={{ padding: "24px 32px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <FieldRow label="IP->TEL">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.ipInRouteMode}
                      onChange={(e) =>
                        handleInputChange("ipInRouteMode", e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        fontSize: 13,
                        height: 32,
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: C.cardBorder,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: C.accent,
                        },
                        "& .MuiSelect-select": { padding: "4px 8px" },
                      }}
                    >
                      {ROUTE_MODE_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="TEL->IP">
                  <FormControl size="small" fullWidth>
                    <MuiSelect
                      value={formData.pstnToIPRouteMode}
                      onChange={(e) =>
                        handleInputChange("pstnToIPRouteMode", e.target.value)
                      }
                      variant="outlined"
                      sx={{
                        fontSize: 13,
                        height: 32,
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: C.cardBorder,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: C.accent,
                        },
                        "& .MuiSelect-select": { padding: "4px 8px" },
                      }}
                    >
                      {ROUTE_MODE_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </MuiSelect>
                  </FormControl>
                </FieldRow>

                <FieldRow label="Route Detection Cycle (s)">
                  <input
                    id="RouteCheckPeriod"
                    type="text"
                    value={formData.routeCheckPeriod || ""}
                    onChange={(e) =>
                      handleInputChange("routeCheckPeriod", e.target.value)
                    }
                    onKeyPress={handleNumberKeyPress}
                    maxLength={31}
                    style={inputStyle}
                  />
                </FieldRow>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 24,
                paddingTop: 16,
                borderTop: `1px solid ${C.cardBorder}`,
              }}
            >
              <Btn
                onClick={handleSave}
                style={{ padding: "8px 36px", fontSize: 13 }}
              >
                Save
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
