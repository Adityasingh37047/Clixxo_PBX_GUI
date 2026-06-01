import React, { useState } from "react";
import {
  ROUTE_SETTINGS_OPTIONS,
  ROUTE_SETTINGS_DEFAULTS,
} from "../../../constants/RouteRoutingParameterPageConstants";
import {
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
} from "@mui/material";

// ── Color palette (matches Change Password) ───────────────────────────────────
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
  fieldHoverBorder: "#64748b",
  fieldFocusBorder: "#0284c7",
  errorRed: "#dc2626",
};

/** Outlined field borders — hover/focus same as Change Password */
const muiOutlinedFieldSx = {
  backgroundColor: C.cardBg,
  "& .MuiOutlinedInput-root": {
    height: 36,
    fontSize: 13,
    backgroundColor: C.cardBg,
    transition: "border-color 0.2s ease",
    "&.Mui-focused": { boxShadow: "none" },
    "& fieldset": {
      borderColor: C.cardBorder,
      borderWidth: "1px",
      transition: "border-color 0.2s ease",
    },
    "&:hover:not(.Mui-focused):not(.Mui-disabled) fieldset": {
      borderColor: `${C.fieldHoverBorder} !important`,
      borderWidth: "1px !important",
    },
    "&.Mui-focused fieldset": {
      borderColor: `${C.fieldFocusBorder} !important`,
      borderWidth: "1px !important",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: `${C.cardBorder} !important`,
    borderWidth: "1px !important",
    transition: "border-color 0.2s ease",
  },
  /* Select root is OutlinedInput — hover on fieldset (Change Password pattern) */
  "&:hover:not(.Mui-focused):not(.Mui-disabled) fieldset": {
    borderColor: `${C.fieldHoverBorder} !important`,
    borderWidth: "1px !important",
  },
  "&:hover:not(.Mui-focused):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: `${C.fieldHoverBorder} !important`,
      borderWidth: "1px !important",
    },
  "& .MuiOutlinedInput-root:hover:not(.Mui-focused):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
    {
      borderColor: `${C.fieldHoverBorder} !important`,
      borderWidth: "1px !important",
    },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: `${C.fieldFocusBorder} !important`,
    borderWidth: "1px !important",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: `${C.fieldFocusBorder} !important`,
    borderWidth: "1px !important",
  },
  "& .MuiSelect-select": {
    fontSize: 13,
    color: C.valueText,
    padding: "6px 10px",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    color: C.valueText,
    padding: "6px 10px",
  },
};

const CARD_RADIUS = 10;
const HEADER_RADIUS = 20;

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
      // borderRadius: 6,
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
  borderRadius: CARD_RADIUS,
  boxShadow: C.cardShadow,
  overflow: "hidden",
};

const blueBarStyle = {
  width: "100%",
  height: 44,
  background: C.cardBg,
  borderTopLeftRadius: HEADER_RADIUS,
  borderTopRightRadius: HEADER_RADIUS,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const saveBtnStyle = {
  minWidth: 110,
  height: 34,
  fontSize: 13,
  letterSpacing: "0.2px",
};

const RouteRoutingParameterPage = () => {
  const [settings, setSettings] = useState({ ...ROUTE_SETTINGS_DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate save logic — replace with API call when available
    setTimeout(() => {
      setLoading(false);
      showToast("Route settings saved successfully.");
    }, 800);
  };

  const handleChange = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
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

        <div style={tableContainerStyle}>
          <div style={blueBarStyle}>Route Settings</div>

          <div className="w-full px-5 pt-3 pb-2">
            <div className="space-y-4 w-full max-w-[500px] mx-auto">
              {/* IP Incoming */}
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-semibold text-left whitespace-nowrap"
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
                  IP Incoming
                </label>
                <FormControl size="small">
                  <Select
                    name="ipIncoming"
                    value={settings.ipIncoming}
                    onChange={(e) => handleChange("ipIncoming", e.target.value)}
                    variant="outlined"
                    sx={{ ...muiOutlinedFieldSx, width: 240 }}
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

              {/* PSTN Incoming */}
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-semibold text-left whitespace-nowrap"
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
                    sx={{ ...muiOutlinedFieldSx, width: 240 }}
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

            <div
              className="w-full flex flex-row flex-wrap justify-center gap-3 mt-3 pt-2 pb-1 mb-0"
              style={{ borderTop: `1px solid ${C.divider}` }}
            >
              <Btn
                variant="primary"
                onClick={handleSave}
                disabled={loading}
                style={saveBtnStyle}
              >
                {loading ? (
                  <>
                    <CircularProgress size={16} sx={{ color: "inherit" }} />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteRoutingParameterPage;
