import React, { useState } from "react";
import {
  ROUTE_MODE_OPTIONS,
  ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
  ROUTE_ROUTING_PARAMETER_TOOLTIPS,
} from "../../../constants/FxsRouteRoutingParameterPageConstants";
import {
  Select,
  MenuItem,
  FormControl,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
/** Match E1-PRI Route Routing Parameters card radii (10px, not table 20px kit). */
// ── Local page UI (inlined from fxsSharedUi) ──

const C = {
  pageBg: "var(--bg-main)",
  cardBg: "var(--bg-surface)",
  cardBorder: "var(--border-strong)",
  labelText: "var(--text-primary)",
  valueText: "var(--text-primary)",
  mutedText: "var(--text-muted)",
  strongText: "var(--text-primary)",
  accent: "var(--accent-brand)",
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
      border: "1px solid var(--border-subtle)",
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
      color: "var(--text-secondary)",
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


const OUTLINED_BORDER = "var(--border-subtle)";
const OUTLINED_HOVER = "var(--border-strong)";
const OUTLINED_FOCUS = "var(--status-primary)";

const muiTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "var(--bg-surface)",
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
    backgroundColor: "var(--bg-surface)",
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
  backgroundColor: "var(--bg-surface)",
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

const ROUTE_CARD_RADIUS = 10;

const cardStyle = {
  background: C.cardBg,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: ROUTE_CARD_RADIUS,
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
};

const cardHeaderStyle = {
  width: "100%",
  minHeight: 44,
  background: C.cardBg,
  borderTopLeftRadius: ROUTE_CARD_RADIUS,
  borderTopRightRadius: ROUTE_CARD_RADIUS,
  display: "flex",
  alignItems: "center",
  padding: "7px 14px",
  fontWeight: 700,
  fontSize: 13,
  color: C.labelText,
  borderBottom: `1px solid ${C.cardBorder}`,
};

const fieldLabelStyle = {
  width: "auto",
  minWidth: 130,
  fontSize: 13,
  fontWeight: 600,
  color: C.labelText,
  textAlign: "left",
  marginRight: 10,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

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

const fieldControlSx = {
  ...muiSelectSx,
  width: 240,
};

const routeCheckPeriodFieldSx = {
  ...muiTextFieldSx,
  width: 240,
  "& .MuiOutlinedInput-root": {
    ...muiTextFieldSx["& .MuiOutlinedInput-root"],
    height: 32,
  },
  "& .MuiInputBase-input": {
    fontSize: 13,
    padding: "6px 10px",
    height: "auto",
    boxSizing: "border-box",
  },
};

const RouteRoutingParameterPage = () => {
  const [formData, setFormData] = useState(
    ROUTE_ROUTING_PARAMETER_INITIAL_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberKeyPress = (e) => {
    const key = e.keyCode || e.which;
    if (key > 47 && key < 58) {
      // Allow numbers
    } else if (key !== 8) {
      e.preventDefault();
    }
  };

  const handleSave = () => {
    setLoading(true);
    try {
      showToast("Routing parameters saved successfully.");
    } catch {
      showToast(
        "Failed to save routing parameters. Please try again.",
        "error",
      );
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
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
              boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            }}
          >
            {toast.msg}
          </Alert>
        )}

        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
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
          <span>Route</span>
          <span>&gt;</span>
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Routing Parameters
          </span>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>Routing Parameters</div>

          <div className="w-full px-5 pt-3 pb-0">
            <div
              className="space-y-4 w-full max-w-[500px] mx-auto"
              style={{ marginBottom: 12 }}
            >
              <div className="flex items-center justify-between">
                <FxsFieldLabel
                  tooltipKey="ipInRouteMode"
                  tooltips={ROUTE_ROUTING_PARAMETER_TOOLTIPS}
                  style={fieldLabelStyle}
                >
                  IP-&gt;TEL
                </FxsFieldLabel>
                <FormControl size="small">
                  <Select
                    name="ipInRouteMode"
                    value={formData.ipInRouteMode}
                    onChange={(e) =>
                      handleInputChange("ipInRouteMode", e.target.value)
                    }
                    variant="outlined"
                    sx={fieldControlSx}
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
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-between">
                <FxsFieldLabel
                  tooltipKey="pstnToIPRouteMode"
                  tooltips={ROUTE_ROUTING_PARAMETER_TOOLTIPS}
                  style={fieldLabelStyle}
                >
                  TEL-&gt;IP
                </FxsFieldLabel>
                <FormControl size="small">
                  <Select
                    name="pstnToIPRouteMode"
                    value={formData.pstnToIPRouteMode}
                    onChange={(e) =>
                      handleInputChange("pstnToIPRouteMode", e.target.value)
                    }
                    variant="outlined"
                    sx={fieldControlSx}
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
                  </Select>
                </FormControl>
              </div>

              <div className="flex items-center justify-between">
                <FxsFieldLabel
                  tooltipKey="routeCheckPeriod"
                  tooltips={ROUTE_ROUTING_PARAMETER_TOOLTIPS}
                  style={fieldLabelStyle}
                >
                  Route Detection Cycle (s)
                </FxsFieldLabel>
                <TextField
                  id="RouteCheckPeriod"
                  value={formData.routeCheckPeriod || ""}
                  onChange={(e) =>
                    handleInputChange("routeCheckPeriod", e.target.value)
                  }
                  onKeyPress={handleNumberKeyPress}
                  inputProps={{ maxLength: 31 }}
                  variant="outlined"
                  size="small"
                  sx={routeCheckPeriodFieldSx}
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div
            style={{
              ...advancedFormInlineFooterStyle,
              width: "100%",
              marginLeft: 0,
              marginRight: 0,
            }}
          >
            <Btn
              variant="primary"
              onClick={handleSave}
              disabled={loading}
              style={advancedFormBtnStyle}
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
  );
};

export default RouteRoutingParameterPage;
