import React, { useState, useEffect } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../../../constants/RouteRoutingParameterPageConstants";
import { Select, MenuItem, FormControl, Alert } from "@mui/material";

// ── Color Palette ─────────────────────────────────────────────────────────────
const C = {
  pageBg: "#f8fafc",
  cardBg: "#ffffff",
  cardBorder: "#9CA3AF",
  divider: "#9CA3AF",
  cardShadow: "0 10px 30px rgba(15,23,42,0.06)",
  labelText: "#3E5475",
  valueText: "#1e293b",
  strongText: "#0f172a",
  mutedText: "#94a3b8",
  accent: "#3E5475",
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  errorRed: "#dc2626",
};

const CARD_RADIUS = 20;

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
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
      color: "#fff",
      border: "1px solid #5A6F8F",
      fontWeight: 600,
      fontSize: 15,
      borderRadius: 6,
      textTransform: "none",
      padding: "6px 28px",
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
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 10,
  boxShadow: C.cardShadow,
  overflow: "hidden",
  paddingBottom: "24px",
};

const blueBarStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: CARD_RADIUS,
  borderTopRightRadius: CARD_RADIUS,
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: "#3E5475",
  borderBottom: `1px solid ${C.cardBorder}`,
};

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    // Simulate save logic
    setTimeout(() => {
      setLoading(false);
      showToast("Route settings saved successfully!");
    }, 800);
  };

  const selectSx = {
    width: "100%",
    height: 36,
    fontSize: 13,
    backgroundColor: C.cardBg,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: C.cardBorder,
      transition: "border-color 0.2s ease",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#64748b",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#0284c7",
      borderWidth: 1,
    },
    "& .MuiSelect-select": {
      fontSize: 13,
      color: C.valueText,
      padding: "6px 10px",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "24px", // To match 36px total height
    },
  };

  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4 flex flex-col items-center"
      style={{ backgroundColor: C.pageBg }}
    >
      <div className="w-full" style={{ maxWidth: 1000 }}>
        {/* Breadcrumb */}
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
          <span>E1-PRI</span>
          <span>&gt;</span>
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: C.strongText, fontWeight: 600 }}>
            Route Settings
          </span>
        </div>

        {/* Global Toast */}
        {toast.msg && (
          <Alert
            severity={toast.type}
            onClose={() => setToast({ msg: "", type: "success" })}
            sx={{
              position: "fixed",
              top: 16,
              right: 16,
              zIndex: 9999,
              boxShadow: C.cardShadow,
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <div style={tableContainerStyle}>
          {/* Header */}
          <div style={blueBarStyle}>Route Settings</div>

          <form
            onSubmit={handleSave}
            style={{
              padding: "32px 24px",
              maxWidth: 500,
              width: "100%",
              margin: "0 auto",
            }}
          >
            <div className="space-y-4">
              {/* IP Incoming */}
              <div className="flex items-center" style={{ flexWrap: "wrap" }}>
                <label
                  style={{
                    width: "auto",
                    minWidth: 130,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    textAlign: "left",
                    marginRight: 10,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  IP Incoming:
                </label>
                <div className="flex-1 flex flex-col">
                  <FormControl size="small" fullWidth>
                    <Select
                      name="ipIncoming"
                      value={settings.ipIncoming}
                      onChange={(e) =>
                        handleChange("ipIncoming", e.target.value)
                      }
                      variant="outlined"
                      sx={selectSx}
                    >
                      {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>

              {/* PSTN Incoming */}
              <div className="flex items-center" style={{ flexWrap: "wrap" }}>
                <label
                  style={{
                    width: "auto",
                    minWidth: 130,
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.labelText,
                    textAlign: "left",
                    marginRight: 10,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  PSTN Incoming:
                </label>
                <div className="flex-1 flex flex-col">
                  <FormControl size="small" fullWidth>
                    <Select
                      name="pstnIncoming"
                      value={settings.pstnIncoming}
                      onChange={(e) =>
                        handleChange("pstnIncoming", e.target.value)
                      }
                      variant="outlined"
                      sx={selectSx}
                    >
                      {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                        <MenuItem
                          key={opt.value}
                          value={opt.value}
                          sx={{ fontSize: 13 }}
                        >
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 gap-4">
              <Btn
                variant="primary"
                disabled={loading}
                type="submit"
                style={{
                  minWidth: 110,
                  height: 36,
                  fontSize: 13,
                  letterSpacing: "0.2px",
                }}
              >
                {loading ? "Saving..." : "Save"}
              </Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
