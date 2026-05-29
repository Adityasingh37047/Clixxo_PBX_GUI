import React, { useState, useEffect } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../../../constants/RouteRoutingParameterPageConstants";
<<<<<<< HEAD
import { Select, MenuItem, FormControl, Alert } from "@mui/material";
=======
import {
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
} from "@mui/material";
>>>>>>> 9845773c3393f4b48bcef7d18b0ff370a7806fb0

// ── Color Palette ─────────────────────────────────────────────────────────────
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
  errorRed: "#dc2626",
};

<<<<<<< HEAD
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
=======
>>>>>>> 9845773c3393f4b48bcef7d18b0ff370a7806fb0

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSave = () => {
    setLoading(true);
    // Simulate save logic
    setTimeout(() => {
      setSaved(true);
      setLoading(false);
      alert("Settings Saved Successfully!");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  return (
    <div
      style={{
        backgroundColor: C.pageBg,
        minHeight: "calc(100vh - 80px)",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
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
            E1-PRI &rsaquo; Route &rsaquo;{" "}
            <span style={{ color: C.valueText, fontWeight: 600 }}>
              Route Settings
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
            <SectionHeading title="Route Settings" />

            <div style={{ padding: "24px 32px" }}>
              <div className="flex-1 py-4 px-16">
                <div className="space-y-6">
                  {/* IP Incoming */}
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm text-gray-600 font-semibold text-left whitespace-nowrap"
                      style={{
                        width: "320px",
                        marginRight: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      IP Incoming
                    </label>
                    <FormControl size="small">
                      <Select
                        name="ipIncoming"
                        value={settings.ipIncoming}
                        onChange={(e) =>
                          handleChange("ipIncoming", e.target.value)
                        }
                        variant="outlined"
                        style={{ width: "240px", height: "36px" }}
                        sx={{
                          fontSize: 14,
                          height: 36,
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#ffffff",
                            height: 36,
                            "& fieldset": { borderColor: "#9ca3af" },
                            "&:hover fieldset": { borderColor: "#1e293b" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e293b",
                            },
                          },
                          "& .MuiSelect-select": {
                            backgroundColor: "#ffffff",
                            padding: "6px 12px",
                            height: "auto",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: 500,
                          },
                        }}
                      >
                        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 14 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>

                  {/* PSTN Incoming */}
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm text-gray-600 font-semibold text-left whitespace-nowrap"
                      style={{
                        width: "320px",
                        marginRight: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      PSTN Incoming
                    </label>
                    <FormControl size="small">
                      <Select
                        name="pstnIncoming"
                        value={settings.pstnIncoming}
                        onChange={(e) =>
                          handleChange("pstnIncoming", e.target.value)
                        }
                        variant="outlined"
                        style={{ width: "240px", height: "36px" }}
                        sx={{
                          fontSize: 14,
                          height: 36,
                          backgroundColor: "#ffffff",
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#ffffff",
                            height: 36,
                            "& fieldset": { borderColor: "#9ca3af" },
                            "&:hover fieldset": { borderColor: "#1e293b" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e293b",
                            },
                          },
                          "& .MuiSelect-select": {
                            backgroundColor: "#ffffff",
                            padding: "6px 12px",
                            height: "auto",
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            fontWeight: 500,
                          },
                        }}
                      >
                        {ROUTE_SETTINGS_OPTIONS.map((opt) => (
                          <MenuItem
                            key={opt.value}
                            value={opt.value}
                            sx={{ fontSize: 14 }}
                          >
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "16px 24px",
              borderTop: `1px solid ${C.cardBorder}`,
              background: "#f8fafc",
            }}
          >
<<<<<<< HEAD
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
=======
            <Button
  variant="contained"
  onClick={handleSave}
  disabled={loading}
  startIcon={
    loading && <CircularProgress size={16} color="inherit" />
  }
  sx={{
    height: 36,
    padding: "0 24px",
    minWidth: 100,
    fontSize: 13,
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 1.5,
    background:
      "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    color: "#fff",
    border: "1px solid #5A6F8F",
    boxShadow: "0 2px 8px #3E5475",
>>>>>>> 9845773c3393f4b48bcef7d18b0ff370a7806fb0

    "&:hover": {
      background:
        "linear-gradient(to bottom, #5A6F8F 0%, #3E5475 60%, #2C3E57 100%)",
    },
  }}
>
  {loading ? "Saving..." : "Save"}
</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
